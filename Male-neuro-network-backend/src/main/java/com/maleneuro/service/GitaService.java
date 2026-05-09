package com.maleneuro.service;

import com.maleneuro.model.NeuralProfile;
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
public class GitaService {

    private static final Logger log = LoggerFactory.getLogger(GitaService.class);

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    private final RestTemplate restTemplate;

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String model;

    public GitaService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Generates Bhagavad Gita guidance tailored to the profile's weakest neural metrics.
     * Returns a structured payload with one shloka card per area that needs work,
     * plus a brief overall reading of the user's coherence score.
     */
    public Map<String, Object> generateGuidance(NeuralProfile profile) {
        try {
            String prompt = buildGuidancePrompt(profile);
            String json = callGroq(prompt, 0.6, 1500);
            return Map.of(
                "coherenceScore", Math.round(profile.getCoherenceScore() * 100),
                "name", nvl(profile.getName(), "seeker"),
                "guidance", json
            );
        } catch (Exception e) {
            log.error("Gita guidance generation failed for profile {}: {}", profile.getId(), e.getMessage(), e);
            return Map.of(
                "coherenceScore", Math.round(profile.getCoherenceScore() * 100),
                "name", nvl(profile.getName(), "seeker"),
                "guidance", buildFallbackGuidance(profile)
            );
        }
    }

    /**
     * Translates an English passage into the target language. The shloka stays in Sanskrit;
     * only the meaning and impact text are translated.
     */
    public String translate(String text, String targetLanguage) {
        if (text == null || text.isBlank()) return "";
        if (targetLanguage == null || targetLanguage.isBlank() || "english".equalsIgnoreCase(targetLanguage)) {
            return text;
        }
        try {
            String prompt = String.format("""
                Translate the following text into %s. Preserve any Sanskrit shloka lines exactly as written —
                do NOT translate Sanskrit. Translate only the English prose. Return only the translated text,
                no preface, no quotes, no explanation.

                Text:
                %s
                """, targetLanguage, text);
            return callGroq(prompt, 0.3, 1200);
        } catch (Exception e) {
            log.error("Gita translation failed: {}", e.getMessage(), e);
            return text;
        }
    }

    // ---- Prompt construction ----

    private String buildGuidancePrompt(NeuralProfile p) {
        Map<String, String> sc = p.getScorecard() != null ? p.getScorecard() : Map.of();
        List<String> weaknesses = new ArrayList<>();
        sc.forEach((k, v) -> { if ("weakness".equals(v)) weaknesses.add(k); });

        // If no formal weakness flag, derive from low values so we always have something to advise on.
        if (weaknesses.isEmpty()) {
            if (p.getMindfulness() < 0.5)        weaknesses.add("mindfulness");
            if (p.getStressLevel() > 0.6)        weaknesses.add("stressLevel");
            if (p.getEmotionalBalance() < 0.5)   weaknesses.add("emotionalBalance");
            if (p.getFocusIndex() < 0.5)         weaknesses.add("focusIndex");
            if (p.getCreativity() < 0.5)         weaknesses.add("creativity");
            if (weaknesses.isEmpty()) weaknesses.add("mindfulness");
        }

        return String.format("""
            You are a Bhagavad Gita scholar AND a neuroscience-informed wellness coach.
            The user's name is %s. Their overall Neural Coherence is %.0f%%.

            Their neural metrics (0.0 to 1.0; for stressLevel and cognitiveLoad LOW is better, for the rest HIGH is better):
            - Sleep Quality:       %.2f
            - Stress Level:        %.2f
            - Focus Index:         %.2f
            - Emotional Balance:   %.2f
            - Creativity:          %.2f
            - Analytical Thinking: %.2f
            - Social Engagement:   %.2f
            - Physical Activity:   %.2f
            - Mindfulness:         %.2f
            - Cognitive Load:      %.2f

            Areas that need work (map each to an appropriate Bhagavad Gita situation —
            anger, fear, depression, lust, pride, greed, laziness, confusion, uncontrolled mind,
            loneliness, demotivated, losing hope, seeking peace, forgetfulness, temptation, envy, etc.):
            %s

            For EACH weakness above, output a card with this EXACT structure (use --- as a separator between cards):

            METRIC: <camelCase metric key, e.g. mindfulness>
            TITLE: <human-readable title, e.g. "Mindfulness">
            SITUATION: <Gita situation category — one of: Anger, Fear, Depression, Lust, Pride, Greed, Laziness, Confusion, Uncontrolled Mind, Loneliness, Demotivated, Losing Hope, Seeking Peace, Forgetfulness, Temptation, Envy, Discrimination, Death of a Loved One, Feeling Sinful, Practising Forgiveness, Dealing with Envy>
            REFERENCE: Chapter X, Verse Y
            SHLOKA_SANSKRIT: <the actual Sanskrit shloka in Devanagari script, properly formatted on 2 lines>
            SHLOKA_TRANSLITERATION: <IAST/Roman transliteration of the shloka, 2 lines>
            MEANING_ENGLISH: <2-4 sentence plain English translation of the verse>
            IMPACT: <2-3 sentences on the neuroscience / life impact of having this metric LOW — what happens to the brain and behavior>
            GITA_ADVICE: <3-5 sentences explaining what the Gita teaches to fulfil/improve this area, tying the verse back to a concrete daily practice>
            ---

            After all cards, add ONE final card (not separated by ---, just appended after the last ---):

            OVERALL_READING: <3-4 sentences synthesising their coherence score and weaknesses into a single Gita-flavoured reflection>

            Constraints:
            - Use real Bhagavad Gita verses. Do not invent verses. If unsure, pick a well-known one for that situation.
            - Sanskrit must be in Devanagari, transliteration in IAST.
            - No markdown formatting (no **bold**, no #headers). Just the labelled fields above.
            - Do not add any preface or closing remark — start with the first METRIC line.
            """,
            nvl(p.getName(), "seeker"),
            p.getCoherenceScore() * 100,
            p.getSleepQuality(),
            p.getStressLevel(),
            p.getFocusIndex(),
            p.getEmotionalBalance(),
            p.getCreativity(),
            p.getAnalyticalThinking(),
            p.getSocialEngagement(),
            p.getPhysicalActivity(),
            p.getMindfulness(),
            p.getCognitiveLoad(),
            String.join(", ", weaknesses)
        );
    }

    // ---- Groq call ----

    @SuppressWarnings("unchecked")
    private String callGroq(String prompt, double temperature, int maxTokens) {
        Map<String, Object> requestBody = Map.of(
            "model", model,
            "messages", List.of(Map.of("role", "user", "content", prompt)),
            "temperature", temperature,
            "max_tokens", maxTokens
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                GROQ_URL,
                HttpMethod.POST,
                request,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> body = response.getBody();
            if (body == null) throw new IllegalStateException("Empty Groq response");
            List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (HttpClientErrorException e) {
            log.error("Groq HTTP error: {} {}", e.getStatusCode(), e.getMessage());
            throw e;
        }
    }

    // ---- Fallback ----

    private String buildFallbackGuidance(NeuralProfile p) {
        return """
            METRIC: mindfulness
            TITLE: Mindfulness
            SITUATION: Seeking Peace
            REFERENCE: Chapter 6, Verse 5
            SHLOKA_SANSKRIT: उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।
            आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥
            SHLOKA_TRANSLITERATION: uddhared ātmanātmānaṁ nātmānam avasādayet
            ātmaiva hy ātmano bandhur ātmaiva ripur ātmanaḥ
            MEANING_ENGLISH: One must elevate oneself by one's own mind, and not degrade oneself. The mind is the friend of the conditioned soul, and also its enemy.
            IMPACT: Low mindfulness scores correlate with default-mode-network overactivity — the brain's "wandering mind" circuit. This drives rumination, anxiety, and weaker emotional regulation in the prefrontal cortex.
            GITA_ADVICE: The Gita teaches that the mind is both adversary and ally — and you are the one who decides which. Begin with five minutes of breath observation each morning. Treat your mind as a student, not a tyrant. Over weeks, the prefrontal cortex strengthens its grip on the amygdala, and stillness becomes natural.
            ---
            OVERALL_READING: The AI guide is temporarily resting. In the meantime, sit with the verse above — it is the seed of every other practice the Gita prescribes.
            """;
    }

    private String nvl(String value, String fallback) {
        return value != null && !value.isBlank() ? value : fallback;
    }
}
