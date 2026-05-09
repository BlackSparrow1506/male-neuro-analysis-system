package com.maleneuro.service;

import com.maleneuro.config.ExternalApis;
import com.maleneuro.model.ChatMessage;
import com.maleneuro.model.ChatRole;
import com.maleneuro.model.NeuralProfile;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    public static final String CB_NAME = "groq";
    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    private final RestTemplate restTemplate;

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.model:" + ExternalApis.Groq.DEFAULT_MODEL + "}")
    private String model;

    @Value("${groq.history.limit:10}")
    private int historyLimit;

    public GeminiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Retry(name = CB_NAME)
    @CircuitBreaker(name = CB_NAME, fallbackMethod = "fallbackResponse")
    public String generateResponse(NeuralProfile profile, List<ChatMessage> priorHistory, String currentMessage) {
        List<Map<String, Object>> messages = buildMessages(profile, priorHistory, currentMessage);

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", messages,
                "temperature", 0.7,
                "max_tokens", 800
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                ExternalApis.Groq.CHAT_COMPLETIONS_URL,
                HttpMethod.POST,
                request,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        return extractText(response.getBody());
    }

    @SuppressWarnings("unused")
    private String fallbackResponse(NeuralProfile profile, List<ChatMessage> priorHistory, String currentMessage, Throwable t) {
        boolean quotaExceeded = (t instanceof HttpClientErrorException hce
                && hce.getStatusCode().value() == 429);
        if (quotaExceeded) {
            log.error("Groq quota exceeded for profile {}; serving degraded fallback", profile.getId());
        } else {
            log.error("Groq call failed for profile {} ({}); serving degraded fallback",
                    profile.getId(), t.getClass().getSimpleName());
        }
        return buildFallbackResponse(profile, quotaExceeded);
    }

    // ---- Request construction ----

    private List<Map<String, Object>> buildMessages(NeuralProfile profile, List<ChatMessage> priorHistory, String currentMessage) {
        List<Map<String, Object>> messages = new ArrayList<>();

        // System prompt as first message
        messages.add(Map.of("role", ChatRole.SYSTEM.wire(), "content", buildSystemPrompt(profile)));

        // Prior conversation history
        int start = Math.max(0, priorHistory.size() - historyLimit);
        for (int i = start; i < priorHistory.size(); i++) {
            ChatMessage msg = priorHistory.get(i);
            messages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
        }

        // Current user message
        messages.add(Map.of("role", ChatRole.USER.wire(), "content", currentMessage));

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

    // ---- Response parsing ----

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> responseBody) {
        if (responseBody == null) {
            throw new IllegalStateException("Empty response body from Groq API");
        }
        try {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse Groq response: " + responseBody, e);
        }
    }

    // ---- Fallback ----

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
