package com.maleneuro.service.llm;

import com.maleneuro.model.NeuralProfile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Fluent Builder for the chat-assistant system prompt. The original prompt
 * was assembled via a single 50-line String.format that mixed the persona
 * line, the metrics table, the lifestyle paragraph, and the response-style
 * guidance into one formatter call. Pulling each section into its own
 * builder method makes intent legible at the call site:
 *
 * <pre>
 * SystemPromptBuilder.forProfile(profile)
 *     .withPersona(coachPersona)
 *     .includeMetricsTable()
 *     .includeLifestyleContext()
 *     .withResponseStyle(coachStyle)
 *     .build();
 * </pre>
 *
 * Sections are emitted in the order they are added — the builder doesn't
 * impose its own structure, so the caller controls the prompt shape
 * (Open/Closed: a new caller can compose a different prompt without
 * touching this class).
 */
public final class SystemPromptBuilder {

    private final NeuralProfile profile;
    private final List<String> sections = new ArrayList<>();

    private SystemPromptBuilder(NeuralProfile profile) {
        this.profile = profile;
    }

    public static SystemPromptBuilder forProfile(NeuralProfile profile) {
        return new SystemPromptBuilder(profile);
    }

    public SystemPromptBuilder withPersona(String personaTemplate) {
        sections.add(String.format(personaTemplate,
                nvl(profile.getName(), "there"),
                profile.getAge(),
                nvl(profile.getOccupation(), "professional")));
        return this;
    }

    public SystemPromptBuilder includeMetricsTable() {
        Map<String, String> sc = profile.getScorecard() != null ? profile.getScorecard() : Map.of();
        sections.add(String.format("""
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
            - Coherence Score:     %.2f""",
            profile.getStressLevel(),        sc.getOrDefault("stressLevel", ""),
            profile.getFocusIndex(),         sc.getOrDefault("focusIndex", ""),
            profile.getCognitiveLoad(),      sc.getOrDefault("cognitiveLoad", ""),
            profile.getEmotionalBalance(),   sc.getOrDefault("emotionalBalance", ""),
            profile.getSleepQuality(),       sc.getOrDefault("sleepQuality", ""),
            profile.getPhysicalActivity(),   sc.getOrDefault("physicalActivity", ""),
            profile.getMindfulness(),        sc.getOrDefault("mindfulness", ""),
            profile.getSocialEngagement(),   sc.getOrDefault("socialEngagement", ""),
            profile.getAnalyticalThinking(), sc.getOrDefault("analyticalThinking", ""),
            profile.getCreativity(),         sc.getOrDefault("creativity", ""),
            profile.getCoherenceScore()));
        return this;
    }

    public SystemPromptBuilder includeLifestyleContext() {
        sections.add(String.format("""
            Lifestyle context:
            - Sleep: %d hours/night
            - Stress source: %s | Primary goal: %s
            - Meditates: %s | Reads regularly: %s | Mood baseline: %s
            - Caffeine: %d cups/day | Social life: %s | Exercise: %d days/week (%s)
            - Diet: %s | Screen time: %d hours/day
            - Hobbies: %s (%s) | Relationship status: %s""",
            profile.getSleepHours(),
            nvl(profile.getStressSource(), "unspecified"),
            nvl(profile.getPrimaryGoal(), "general wellness"),
            profile.isMeditates(),
            profile.isReadsRegularly(),
            nvl(profile.getMoodBaseline(), "neutral"),
            profile.getCaffeineIntake(),
            nvl(profile.getSocialLife(), "moderate"),
            profile.getExerciseFrequency(),
            nvl(profile.getExerciseType(), "general"),
            nvl(profile.getDietQuality(), "average"),
            profile.getScreenTimeHours(),
            profile.isHasHobbies() ? "yes" : "no",
            nvl(profile.getHobbyType(), "none"),
            nvl(profile.getRelationshipStatus(), "unspecified")));
        return this;
    }

    public SystemPromptBuilder withResponseStyle(String styleBlock) {
        sections.add(styleBlock);
        return this;
    }

    public String build() {
        return String.join("\n\n", sections) + "\n";
    }

    private static String nvl(String value, String fallback) {
        return value != null && !value.isBlank() ? value : fallback;
    }
}
