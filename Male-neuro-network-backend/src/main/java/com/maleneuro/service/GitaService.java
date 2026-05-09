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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GitaService {

    private static final Logger log = LoggerFactory.getLogger(GitaService.class);

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    private static final Pattern DEVANAGARI = Pattern.compile("[\\u0900-\\u097F]");
    private static final Pattern SHLOKA_BLOCK = Pattern.compile(
        "SHLOKA_SANSKRIT:\\s*(.*?)(?=\\nSHLOKA_TRANSLITERATION:|\\nMEANING_ENGLISH:|\\n---|$)",
        Pattern.DOTALL
    );

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
            // Each card carries Sanskrit + IAST + 3 prose blocks; with multiple weaknesses
            // and an overall reading we need plenty of room or the response gets truncated mid-card.
            String content = callGroq(prompt, 0.6, 4000);

            // The model occasionally puts IAST in the SHLOKA_SANSKRIT field.
            // Detect that and retry once with a stricter, lower-temperature instruction.
            if (!sanskritIsDevanagari(content)) {
                log.warn("Gita response had non-Devanagari Sanskrit for profile {}, retrying", profile.getId());
                String stricter = prompt + """

                    CRITICAL CORRECTION: SHLOKA_SANSKRIT MUST be in Devanagari script (देवनागरी).
                    Do NOT put Roman/IAST text in SHLOKA_SANSKRIT — IAST belongs ONLY in SHLOKA_TRANSLITERATION.
                    Example of correct SHLOKA_SANSKRIT format:
                    SHLOKA_SANSKRIT: कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।
                    मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥
                    """;
                content = callGroq(stricter, 0.3, 4000);
            }

            return Map.of(
                "coherenceScore", Math.round(profile.getCoherenceScore() * 100),
                "name", nvl(profile.getName(), "seeker"),
                "guidance", content
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

    /** Returns true if every SHLOKA_SANSKRIT block in the model output contains Devanagari characters. */
    private boolean sanskritIsDevanagari(String content) {
        if (content == null) return false;
        Matcher m = SHLOKA_BLOCK.matcher(content);
        boolean foundAny = false;
        while (m.find()) {
            foundAny = true;
            String shloka = m.group(1);
            if (shloka == null || !DEVANAGARI.matcher(shloka).find()) return false;
        }
        return foundAny;
    }

    /** Pretty label and current percentage for the prompt's "areas that need work" list. */
    private Map<String, Object> describeWeakness(String key, NeuralProfile p) {
        Map<String, double[]> table = new LinkedHashMap<>();
        // value, isInverse (true => high is bad)
        table.put("sleepQuality",       new double[]{ p.getSleepQuality(),       0 });
        table.put("stressLevel",        new double[]{ p.getStressLevel(),        1 });
        table.put("focusIndex",         new double[]{ p.getFocusIndex(),         0 });
        table.put("emotionalBalance",   new double[]{ p.getEmotionalBalance(),   0 });
        table.put("creativity",         new double[]{ p.getCreativity(),         0 });
        table.put("analyticalThinking", new double[]{ p.getAnalyticalThinking(), 0 });
        table.put("socialEngagement",   new double[]{ p.getSocialEngagement(),   0 });
        table.put("physicalActivity",   new double[]{ p.getPhysicalActivity(),   0 });
        table.put("mindfulness",        new double[]{ p.getMindfulness(),        0 });
        table.put("cognitiveLoad",      new double[]{ p.getCognitiveLoad(),      1 });

        double[] entry = table.getOrDefault(key, new double[]{ 0.5, 0 });
        int pct = (int) Math.round(entry[0] * 100);
        boolean inverse = entry[1] == 1;
        String label = key.replaceAll("([a-z])([A-Z])", "$1 $2");
        label = Character.toUpperCase(label.charAt(0)) + label.substring(1);
        return Map.of(
            "key", key,
            "label", label,
            "pct", pct,
            "phrase", inverse
                ? String.format("%s at %d%% (elevated — lower is better)", label, pct)
                : String.format("%s at %d%% (low — higher is better)", label, pct)
        );
    }

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

        StringBuilder weaknessLines = new StringBuilder();
        for (String w : weaknesses) {
            Map<String, Object> d = describeWeakness(w, p);
            weaknessLines.append("- ").append(d.get("key"))
                .append(" → ").append(d.get("phrase")).append('\n');
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

            Areas that need work — each line shows the metric key, the current score, and which direction is healthy.
            Map each one to an appropriate Bhagavad Gita situation (anger, fear, depression, lust, pride, greed,
            laziness, confusion, uncontrolled mind, loneliness, demotivated, losing hope, seeking peace,
            forgetfulness, temptation, envy, etc.):
            %s

            For EACH weakness above, output a card with this EXACT structure (use --- as a separator between cards):

            METRIC: <camelCase metric key, e.g. mindfulness>
            TITLE: <human-readable title, e.g. "Mindfulness">
            SCORE_LINE: Your <Title> is at <X>%% — <one short sentence in plain English explaining why this is a concern, and naming the Gita situation it maps to>. That's why the Gita's teaching below applies.
            SITUATION: <Gita situation category — one of: Anger, Fear, Depression, Lust, Pride, Greed, Laziness, Confusion, Uncontrolled Mind, Loneliness, Demotivated, Losing Hope, Seeking Peace, Forgetfulness, Temptation, Envy, Discrimination, Death of a Loved One, Feeling Sinful, Practising Forgiveness, Dealing with Envy>
            REFERENCE: Chapter X, Verse Y
            SHLOKA_SANSKRIT: <the actual Sanskrit shloka in DEVANAGARI SCRIPT ONLY, on 2 lines. Never use Roman/IAST here. Example: कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।>
            SHLOKA_TRANSLITERATION: <IAST/Roman transliteration of the same shloka, 2 lines>
            MEANING_ENGLISH: <2-4 sentence plain English translation of the verse>
            IMPACT: <2-3 sentences on the neuroscience / life impact of having this metric out of balance — what happens to the brain and behavior>
            GITA_ADVICE: <3-5 sentences explaining what the Gita teaches to fulfil/improve this area, tying the verse back to a concrete daily practice. Begin by referring back to the score (e.g. "With your Mindfulness at 20%%, the Gita's prescription is...")>
            ---

            After all cards, add ONE final card (not separated by ---, just appended after the last ---):

            OVERALL_READING: <3-4 sentences synthesising their coherence score and weaknesses into a single Gita-flavoured reflection>

            HARD CONSTRAINTS:
            - Use real Bhagavad Gita verses. Do not invent verses. If unsure, pick a well-known one for that situation.
            - SHLOKA_SANSKRIT MUST be Devanagari (देवनागरी). SHLOKA_TRANSLITERATION MUST be IAST/Roman. Never swap them.
            - SCORE_LINE MUST contain the literal percentage you were given for that metric.
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
            weaknessLines.toString().trim()
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
        int mindPct = (int) Math.round(p.getMindfulness() * 100);
        return String.format("""
            METRIC: mindfulness
            TITLE: Mindfulness
            SCORE_LINE: Your Mindfulness is at %d%% — the mind is restless and untrained, which the Gita addresses as the problem of the uncontrolled mind. That's why the Gita's teaching below applies.
            SITUATION: Seeking Peace
            REFERENCE: Chapter 6, Verse 5
            SHLOKA_SANSKRIT: उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।
            आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥
            SHLOKA_TRANSLITERATION: uddhared ātmanātmānaṁ nātmānam avasādayet
            ātmaiva hy ātmano bandhur ātmaiva ripur ātmanaḥ
            MEANING_ENGLISH: One must elevate oneself by one's own mind, and not degrade oneself. The mind is the friend of the conditioned soul, and also its enemy.
            IMPACT: Low mindfulness scores correlate with default-mode-network overactivity — the brain's "wandering mind" circuit. This drives rumination, anxiety, and weaker emotional regulation in the prefrontal cortex.
            GITA_ADVICE: With your Mindfulness at %d%%, the Gita's prescription is steady, daily training of the mind. Begin with five minutes of breath observation each morning. Treat your mind as a student, not a tyrant. Over weeks, the prefrontal cortex strengthens its grip on the amygdala, and stillness becomes natural.
            ---
            OVERALL_READING: The AI guide is temporarily resting. In the meantime, sit with the verse above — it is the seed of every other practice the Gita prescribes.
            """, mindPct, mindPct);
    }

    private String nvl(String value, String fallback) {
        return value != null && !value.isBlank() ? value : fallback;
    }
}
