package com.maleneuro.service;

import com.maleneuro.model.AgentRun;
import com.maleneuro.model.ChatMessage;
import com.maleneuro.model.NeuralProfile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Coordinates a chat reply through Router → Responder → Validator → optional Recovery.
 * Each step is recorded on the AgentRun so the trace can be replayed in the UI.
 */
@Service
public class AgentOrchestratorService {

    public static final String INTENT_WELLNESS    = "wellness_advice";
    public static final String INTENT_METRIC      = "metric_question";
    public static final String INTENT_OUT_OF_SCOPE = "out_of_scope";

    private static final int VALIDATOR_THRESHOLD = 60;
    private static final int PREVIEW_MAX = 280;

    private static final List<Pattern> OUT_OF_SCOPE_PATTERNS = List.of(
            Pattern.compile("(?i)\\b(write|fix|debug|generate|review)\\s+(code|script|function|sql|html|css|javascript|python|java)\\b"),
            Pattern.compile("(?i)\\b(weather|stock|crypto|bitcoin|ethereum|exchange\\s+rate|news|sports|election)\\b"),
            Pattern.compile("(?i)\\b(translate|spell|grammar)\\s+this\\b"),
            Pattern.compile("(?i)\\b(recipe|cooking|directions|navigate|gps)\\b")
    );

    private static final List<Pattern> METRIC_PATTERNS = List.of(
            Pattern.compile("(?i)\\b(stress|focus|sleep|cognitive|emotional|coherence|mindfulness|creativity|analytical|social\\s+engagement|physical\\s+activity)\\b"),
            Pattern.compile("(?i)\\bmy\\s+(score|metric|level|index|number)\\b"),
            Pattern.compile("(?i)\\b(why\\s+(am|do)\\s+i|what.+my)\\b")
    );

    private static final String OUT_OF_SCOPE_REPLY =
            "I'm focused on neural wellness and your specific brain-health metrics. " +
            "Ask me about your stress, focus, sleep, emotional balance, coherence — or about " +
            "habits to shift any of those. I'll skip topics outside that scope.";

    private static final Logger log = LoggerFactory.getLogger(AgentOrchestratorService.class);

    private final ChatResponseService chatResponseService;
    private final GuardrailService guardrailService;
    private final EvalService evalService;

    public AgentOrchestratorService(ChatResponseService chatResponseService,
                                    GuardrailService guardrailService,
                                    EvalService evalService) {
        this.chatResponseService = chatResponseService;
        this.guardrailService = guardrailService;
        this.evalService = evalService;
    }

    public AgentRun run(NeuralProfile profile, List<ChatMessage> priorHistory, String userMessage) {
        long started = System.currentTimeMillis();
        AgentRun run = new AgentRun();
        run.setUserId(profile.getUserId());
        run.setProfileId(profile.getId());
        run.setMessage(userMessage);

        // 1. Router
        AgentRun.Step routerStep = openStep(run, "router", userMessage);
        String intent = classify(userMessage);
        run.setIntent(intent);
        closeStep(routerStep, "success", intent, "intent=" + intent);

        if (INTENT_OUT_OF_SCOPE.equals(intent)) {
            AgentRun.Step rs = openStep(run, "responder", userMessage);
            closeStep(rs, "skipped", OUT_OF_SCOPE_REPLY, "out-of-scope guard returned canned refusal");
            run.setResponse(OUT_OF_SCOPE_REPLY);
            run.setFinalScore(100);
            run.setTotalLatencyMs(System.currentTimeMillis() - started);
            return run;
        }

        // 2. Responder
        AgentRun.Step responderStep = openStep(run, "responder", userMessage);
        String draft;
        try {
            draft = chatResponseService.generateResponse(profile, priorHistory, userMessage);
        } catch (RuntimeException ex) {
            closeStep(responderStep, "failed", null, "Groq call failed: " + ex.getClass().getSimpleName());
            run.setTotalLatencyMs(System.currentTimeMillis() - started);
            throw ex;
        }
        GuardrailService.OutputFilter filter = guardrailService.filterOutput(draft);
        String response = filter.text();
        closeStep(responderStep, "success", response,
                filter.modified() ? "PII redacted: " + String.join(", ", filter.redactedKinds()) : null);

        // 3. Validator
        AgentRun.Step validatorStep = openStep(run, "validator", response);
        EvalService.Result eval = evalService.evaluate(userMessage, response);
        boolean valid = eval.score() >= VALIDATOR_THRESHOLD;
        closeStep(validatorStep, valid ? "success" : "failed",
                "score=" + eval.score(),
                valid ? "above threshold (" + VALIDATOR_THRESHOLD + ")"
                      : "below threshold; notes=" + String.join(",", eval.notes()));

        // 4. Recovery — one retry with stricter prompt if validator rejected
        if (!valid) {
            AgentRun.Step recoveryStep = openStep(run, "recovery", "retry with stricter prompt");
            String stricter = userMessage
                    + "\n\n[Coach guidance: Be direct and actionable. "
                    + "Reference my specific metrics. Avoid disclaimers. 3 paragraphs max.]";
            try {
                String retryDraft = chatResponseService.generateResponse(profile, priorHistory, stricter);
                GuardrailService.OutputFilter retryFilter = guardrailService.filterOutput(retryDraft);
                String retryResponse = retryFilter.text();
                EvalService.Result retryEval = evalService.evaluate(userMessage, retryResponse);
                if (retryEval.score() > eval.score()) {
                    response = retryResponse;
                    eval = retryEval;
                    closeStep(recoveryStep, "success", retryResponse,
                            "score lifted to " + retryEval.score());
                } else {
                    closeStep(recoveryStep, "skipped", null,
                            "retry score=" + retryEval.score() + " not better; kept original");
                }
            } catch (RuntimeException ex) {
                closeStep(recoveryStep, "failed", null, "recovery call failed: " + ex.getMessage());
                log.warn("Recovery step failed for profile {}: {}", profile.getId(), ex.getMessage());
            }
        }

        run.setResponse(response);
        run.setFinalScore(eval.score());
        run.setTotalLatencyMs(System.currentTimeMillis() - started);
        return run;
    }

    String classify(String userMessage) {
        if (userMessage == null) return INTENT_WELLNESS;
        for (Pattern p : OUT_OF_SCOPE_PATTERNS) {
            if (p.matcher(userMessage).find()) return INTENT_OUT_OF_SCOPE;
        }
        for (Pattern p : METRIC_PATTERNS) {
            if (p.matcher(userMessage).find()) return INTENT_METRIC;
        }
        return INTENT_WELLNESS;
    }

    private AgentRun.Step openStep(AgentRun run, String name, String input) {
        AgentRun.Step s = new AgentRun.Step(name, preview(input));
        run.getSteps().add(s);
        return s;
    }

    private void closeStep(AgentRun.Step step, String status, String output, String notes) {
        step.setStatus(status);
        step.setOutputPreview(preview(output));
        step.setNotes(notes);
        step.setLatencyMs(java.time.Duration.between(step.getStartedAt(), java.time.Instant.now()).toMillis());
    }

    private String preview(String text) {
        if (text == null) return null;
        return text.length() <= PREVIEW_MAX ? text : text.substring(0, PREVIEW_MAX) + "…";
    }
}
