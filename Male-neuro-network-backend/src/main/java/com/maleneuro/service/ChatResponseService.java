package com.maleneuro.service;

import com.maleneuro.model.ChatMessage;
import com.maleneuro.model.NeuralProfile;
import com.maleneuro.service.llm.LlmClient;
import com.maleneuro.service.llm.SystemPromptBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

import java.util.ArrayList;
import java.util.List;

/**
 * Domain layer for the chat assistant. Owns the system-prompt construction,
 * the message-list assembly, and the profile-aware fallback that runs when
 * the underlying {@link LlmClient} call fails.
 *
 * The HTTP plumbing, retry policy, and circuit breaker live on the
 * {@link com.maleneuro.service.llm.GroqLlmClient} bean (DIP — this class
 * depends only on the {@link LlmClient} port).
 *
 * Replaces the old GeminiService, whose name predated the Groq migration.
 */
@Service
public class ChatResponseService {

    private static final Logger log = LoggerFactory.getLogger(ChatResponseService.class);

    private static final double DEFAULT_TEMPERATURE = 0.7;
    private static final int    DEFAULT_MAX_TOKENS  = 800;

    private static final String COACH_PERSONA = """
            You are a neural health coach and neuroscience advisor integrated into the Male Neuro Network app.
            You are speaking with %s, a %d-year-old %s.""";

    private static final String COACH_RESPONSE_STYLE = """
            Respond conversationally. Reference their specific metrics and lifestyle when relevant.
            Explain the neuroscience behind what they experience. Give concrete, actionable advice.
            Keep responses to 3–5 paragraphs. Be warm, direct, and science-grounded.
            Do not start with generic greetings. Do not use bullet lists unless listing specific action steps.""";

    private final LlmClient llmClient;
    private final int historyLimit;

    public ChatResponseService(LlmClient llmClient,
                                @Value("${groq.history.limit:10}") int historyLimit) {
        this.llmClient = llmClient;
        this.historyLimit = historyLimit;
    }

    public String generateResponse(NeuralProfile profile, List<ChatMessage> priorHistory, String currentMessage) {
        List<LlmClient.LlmMessage> messages = buildMessages(profile, priorHistory, currentMessage);
        try {
            return llmClient.chatComplete(new LlmClient.LlmRequest(messages, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS));
        } catch (RuntimeException ex) {
            boolean quotaExceeded = ex instanceof HttpClientErrorException hce && hce.getStatusCode().value() == 429;
            if (quotaExceeded) {
                log.error("LLM quota exceeded for profile {}; serving degraded fallback", profile.getId());
            } else {
                log.error("LLM call failed for profile {} ({}); serving degraded fallback",
                        profile.getId(), ex.getClass().getSimpleName());
            }
            return buildFallbackResponse(profile, quotaExceeded);
        }
    }

    private List<LlmClient.LlmMessage> buildMessages(NeuralProfile profile,
                                                      List<ChatMessage> priorHistory,
                                                      String currentMessage) {
        List<LlmClient.LlmMessage> messages = new ArrayList<>();
        messages.add(LlmClient.LlmMessage.system(SystemPromptBuilder.forProfile(profile)
                .withPersona(COACH_PERSONA)
                .includeMetricsTable()
                .includeLifestyleContext()
                .withResponseStyle(COACH_RESPONSE_STYLE)
                .build()));

        int start = Math.max(0, priorHistory.size() - historyLimit);
        for (int i = start; i < priorHistory.size(); i++) {
            ChatMessage msg = priorHistory.get(i);
            messages.add(new LlmClient.LlmMessage(msg.getRole(), msg.getContent()));
        }

        messages.add(LlmClient.LlmMessage.user(currentMessage));
        return messages;
    }

    private String buildFallbackResponse(NeuralProfile p, boolean quotaExceeded) {
        String reason = quotaExceeded
            ? "The AI service has reached its API quota limit — the administrator needs to update the API key."
            : "The AI analysis engine is temporarily unavailable.";
        return String.format(
            "%s In the meantime, %s, based on your current metrics — " +
            "coherence score of %.0f%%, stress at %.0f%% — " +
            "I'd suggest focusing on your primary goal (%s). " +
            "Please try again shortly.",
            reason,
            nvl(p.getName(), "there"),
            p.getCoherenceScore() * 100,
            p.getStressLevel() * 100,
            nvl(p.getPrimaryGoal(), "overall balance")
        );
    }

    private String nvl(String value, String fallback) {
        return value != null && !value.isBlank() ? value : fallback;
    }
}
