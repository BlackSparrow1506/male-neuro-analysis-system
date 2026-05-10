package com.maleneuro.service;

import com.maleneuro.model.ChatMessage;
import com.maleneuro.model.ChatRole;
import com.maleneuro.model.NeuralProfile;
import com.maleneuro.service.llm.LlmClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
        messages.add(LlmClient.LlmMessage.system(buildSystemPrompt(profile)));

        int start = Math.max(0, priorHistory.size() - historyLimit);
        for (int i = start; i < priorHistory.size(); i++) {
            ChatMessage msg = priorHistory.get(i);
            messages.add(new LlmClient.LlmMessage(msg.getRole(), msg.getContent()));
        }

        messages.add(LlmClient.LlmMessage.user(currentMessage));
        return messages;
    }

    private String buildSystemPrompt(NeuralProfile p) {
        Map<String, String> sc = p.getScorecard() != null ? p.getScorecard() : Map.of();

        return String.format("""
            You are a neural health coach and neuroscience advisor integrated into the Male Neuro Network app.
            You are speaking with %s, a %d-year-old %s.

            Current neural metrics (0.0–1.0 scale; for stressLevel lower is better, for all others higher is better):
            - Stress Level:        %.2f  [%s]
            - Focus Index:         %.2f  [%s]
            - Cognitive Load:      %.2f  [%s]
            - Emotional Balance:   %.2f  [%s]
            - Sleep Quality:       %.2f  [%s]
            - Physical Activity:   %.2f  [%s]
            - Mindfulness:         %.2f  [%s]
            - Social Engagement:   %.2f  [%s]
            - Analytical Thinking: %.2f  [%s]
            - Creativity:          %.2f  [%s]
            - Coherence Score:     %.2f

            Lifestyle context:
            - Sleep: %d hours/night
            - Stress source: %s | Primary goal: %s
            - Meditates: %s | Reads regularly: %s | Mood baseline: %s
            - Caffeine: %d cups/day | Social life: %s | Exercise: %d days/week (%s)
            - Diet: %s | Screen time: %d hours/day
            - Hobbies: %s (%s) | Relationship status: %s

            Respond conversationally. Reference their specific metrics and lifestyle when relevant.
            Explain the neuroscience behind what they experience. Give concrete, actionable advice.
            Keep responses to 3–5 paragraphs. Be warm, direct, and science-grounded.
            Do not start with generic greetings. Do not use bullet lists unless listing specific action steps.
            """,
            nvl(p.getName(), "there"), p.getAge(), nvl(p.getOccupation(), "professional"),
            p.getStressLevel(),        sc.getOrDefault("stressLevel", ""),
            p.getFocusIndex(),         sc.getOrDefault("focusIndex", ""),
            p.getCognitiveLoad(),      sc.getOrDefault("cognitiveLoad", ""),
            p.getEmotionalBalance(),   sc.getOrDefault("emotionalBalance", ""),
            p.getSleepQuality(),       sc.getOrDefault("sleepQuality", ""),
            p.getPhysicalActivity(),   sc.getOrDefault("physicalActivity", ""),
            p.getMindfulness(),        sc.getOrDefault("mindfulness", ""),
            p.getSocialEngagement(),   sc.getOrDefault("socialEngagement", ""),
            p.getAnalyticalThinking(), sc.getOrDefault("analyticalThinking", ""),
            p.getCreativity(),         sc.getOrDefault("creativity", ""),
            p.getCoherenceScore(),
            p.getSleepHours(),
            nvl(p.getStressSource(), "unspecified"), nvl(p.getPrimaryGoal(), "general wellness"),
            p.isMeditates(), p.isReadsRegularly(), nvl(p.getMoodBaseline(), "neutral"),
            p.getCaffeineIntake(), nvl(p.getSocialLife(), "moderate"),
            p.getExerciseFrequency(), nvl(p.getExerciseType(), "general"),
            nvl(p.getDietQuality(), "average"), p.getScreenTimeHours(),
            p.isHasHobbies() ? "yes" : "no", nvl(p.getHobbyType(), "none"),
            nvl(p.getRelationshipStatus(), "unspecified")
        );
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
