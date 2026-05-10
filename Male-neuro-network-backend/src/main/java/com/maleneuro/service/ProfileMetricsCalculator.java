package com.maleneuro.service;

import com.maleneuro.model.NeuralConnection;
import com.maleneuro.model.NeuralProfile;
import com.maleneuro.model.ScorecardLevel;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Pure, stateless calculator for everything derived from a NeuralProfile's
 * lifestyle inputs: per-metric scoring, brain-region activity, neural
 * connections, weighted coherence, and the strength/weakness scorecard.
 *
 * No repositories, no external calls — every method operates on the profile
 * argument alone, which keeps the math testable in isolation and lets it be
 * reused from any service (profile lifecycle, chat analysis, etc.).
 */
@Component
public class ProfileMetricsCalculator {

    public void recomputeAll(NeuralProfile profile) {
        recomputeInitialMetrics(profile);
        regenerateConnections(profile);
        recomputeCoherence(profile);
        regenerateScorecard(profile);
    }

    public void recomputeFromMessage(NeuralProfile profile) {
        recalculateConnections(profile);
        recomputeCoherence(profile);
        regenerateScorecard(profile);
    }

    // ========================================================
    // INITIAL METRICS — derived from lifestyle inputs
    // ========================================================

    public void recomputeInitialMetrics(NeuralProfile p) {
        p.setStressLevel(calculateStress(p));
        p.setFocusIndex(calculateFocus(p));
        p.setCognitiveLoad(calculateCognitive(p));
        p.setEmotionalBalance(calculateEmotional(p));
        p.setCreativity(calculateCreativity(p));
        p.setAnalyticalThinking(calculateAnalytical(p));
        p.setSocialEngagement(calculateSocial(p));
        p.setPhysicalActivity(calculatePhysical(p));
        p.setSleepQuality(calculateSleep(p));
        p.setMindfulness(calculateMindfulness(p));
        regenerateBrainRegions(p);
    }

    private double calculateStress(NeuralProfile p) {
        double stress = 0.4;
        if ("work".equals(p.getStressSource()) || "finances".equals(p.getStressSource())) stress += 0.15;
        if ("academic".equals(p.getStressSource())) stress += 0.1;
        if (p.getSleepHours() < 6) stress += 0.15;
        if (p.getSleepHours() >= 7 && p.getSleepHours() <= 9) stress -= 0.1;
        if (p.getScreenTimeHours() > 8) stress += 0.1;
        if (p.getCaffeineIntake() > 4) stress += 0.1;
        if ("anxious".equals(p.getMoodBaseline())) stress += 0.15;
        if ("calm".equals(p.getMoodBaseline())) stress -= 0.15;
        if (p.isMeditates()) stress -= 0.1;
        return clamp(stress);
    }

    private double calculateFocus(NeuralProfile p) {
        double focus = 0.4;
        if (p.isMeditates()) focus += 0.15;
        if (p.isReadsRegularly()) focus += 0.1;
        if (p.getSleepHours() >= 7) focus += 0.1;
        if (p.getScreenTimeHours() > 10) focus -= 0.15;
        if (p.getCaffeineIntake() >= 1 && p.getCaffeineIntake() <= 3) focus += 0.05;
        if (p.getCaffeineIntake() > 5) focus -= 0.1;
        if (isKnowledgeWorker(p.getOccupation())) focus += 0.1;
        return clamp(focus);
    }

    private double calculateCognitive(NeuralProfile p) {
        double cognitive = 0.4;
        if (isKnowledgeWorker(p.getOccupation())) cognitive += 0.15;
        if (p.isReadsRegularly()) cognitive += 0.1;
        if ("analytical".equals(p.getHobbyType())) cognitive += 0.1;
        if (p.getSleepHours() < 5) cognitive -= 0.1;
        return clamp(cognitive);
    }

    private double calculateEmotional(NeuralProfile p) {
        double emotional = 0.5;
        if (p.isMeditates()) emotional += 0.15;
        if ("active".equals(p.getSocialLife()) || "very_active".equals(p.getSocialLife())) emotional += 0.1;
        if ("isolated".equals(p.getSocialLife())) emotional -= 0.15;
        if ("in_relationship".equals(p.getRelationshipStatus()) || "married".equals(p.getRelationshipStatus())) emotional += 0.05;
        if ("calm".equals(p.getMoodBaseline())) emotional += 0.1;
        if ("low".equals(p.getMoodBaseline())) emotional -= 0.15;
        if (p.getSleepHours() >= 7) emotional += 0.05;
        return clamp(emotional);
    }

    private double calculateCreativity(NeuralProfile p) {
        double creativity = 0.35;
        if ("creative".equals(p.getHobbyType())) creativity += 0.2;
        if (p.isHasHobbies()) creativity += 0.1;
        if (p.getSleepHours() >= 7) creativity += 0.05;
        if ("low".equals(p.getMoodBaseline()) || "anxious".equals(p.getMoodBaseline())) creativity -= 0.1;
        if (p.isReadsRegularly()) creativity += 0.1;
        return clamp(creativity);
    }

    private double calculateAnalytical(NeuralProfile p) {
        double analytical = 0.4;
        if (isKnowledgeWorker(p.getOccupation())) analytical += 0.15;
        if ("analytical".equals(p.getHobbyType())) analytical += 0.15;
        if (p.isReadsRegularly()) analytical += 0.1;
        return clamp(analytical);
    }

    private double calculateSocial(NeuralProfile p) {
        double social = 0.3;
        switch (p.getSocialLife() != null ? p.getSocialLife() : "") {
            case "very_active" -> social = 0.9;
            case "active" -> social = 0.7;
            case "moderate" -> social = 0.5;
            case "limited" -> social = 0.3;
            case "isolated" -> social = 0.1;
        }
        if ("social".equals(p.getHobbyType())) social += 0.1;
        return clamp(social);
    }

    private double calculatePhysical(NeuralProfile p) {
        double physical = 0.2;
        if (p.getExerciseFrequency() >= 5) physical = 0.85;
        else if (p.getExerciseFrequency() >= 3) physical = 0.65;
        else if (p.getExerciseFrequency() >= 1) physical = 0.4;
        if ("physical".equals(p.getHobbyType())) physical += 0.1;
        return clamp(physical);
    }

    private double calculateSleep(NeuralProfile p) {
        double sleep = 0.5;
        if (p.getSleepHours() >= 7 && p.getSleepHours() <= 9) sleep = 0.85;
        else if (p.getSleepHours() >= 6) sleep = 0.6;
        else if (p.getSleepHours() < 5) sleep = 0.2;
        if (p.getScreenTimeHours() > 8) sleep -= 0.1;
        if (p.getCaffeineIntake() > 3) sleep -= 0.1;
        if (p.isMeditates()) sleep += 0.1;
        return clamp(sleep);
    }

    private double calculateMindfulness(NeuralProfile p) {
        double mindfulness = 0.2;
        if (p.isMeditates()) mindfulness += 0.35;
        if (p.isReadsRegularly()) mindfulness += 0.1;
        if ("calm".equals(p.getMoodBaseline())) mindfulness += 0.1;
        if (p.getExerciseFrequency() >= 3) mindfulness += 0.05;
        return clamp(mindfulness);
    }

    private void regenerateBrainRegions(NeuralProfile p) {
        Map<String, Double> regions = p.getBrainRegions();
        regions.put("prefrontalCortex", clamp(0.4 + p.getFocusIndex() * 0.3 + p.getAnalyticalThinking() * 0.2));
        regions.put("amygdala",         clamp(0.3 + p.getStressLevel() * 0.5));
        regions.put("hippocampus",      clamp(0.4 + p.getMindfulness() * 0.2 + (p.isReadsRegularly() ? 0.15 : 0)));
        regions.put("cerebellum",       clamp(0.3 + p.getPhysicalActivity() * 0.4));
        regions.put("hypothalamus",     clamp(0.4 + p.getStressLevel() * 0.2 + (1.0 - p.getSleepQuality()) * 0.2));
        regions.put("striatum",         clamp(0.3 + p.getCreativity() * 0.2 + p.getPhysicalActivity() * 0.15));
        regions.put("parietalLobe",     clamp(0.35 + p.getAnalyticalThinking() * 0.3));
        regions.put("temporalLobe",     clamp(0.35 + p.getCreativity() * 0.2 + p.getSocialEngagement() * 0.15));
        regions.put("occipitalLobe",    clamp(0.4 + p.getScreenTimeHours() * 0.02));
        regions.put("brainstem",        clamp(0.6 + p.getSleepQuality() * 0.2));
        regions.put("thalamusLeft",     clamp(0.4 + p.getFocusIndex() * 0.2));
        regions.put("thalamusRight",    clamp(0.4 + p.getEmotionalBalance() * 0.2));
    }

    // ========================================================
    // COHERENCE — weighted multi-factor score
    // ========================================================

    /**
     * Coherence = how well-balanced and optimally functioning the neural network is.
     * Sleep 20%, Stress mgmt 20%, Focus/load ratio 15%, Emotional 15%,
     * Physical 10%, Social 10%, Mindfulness 10%.
     */
    public void recomputeCoherence(NeuralProfile p) {
        double sleepFactor       = p.getSleepQuality() * 0.20;
        double stressManagement  = (1.0 - p.getStressLevel()) * 0.20;
        double focusLoadRatio    = (p.getCognitiveLoad() > 0
                ? Math.min(1.0, p.getFocusIndex() / Math.max(0.1, p.getCognitiveLoad()))
                : p.getFocusIndex()) * 0.15;
        double emotionalFactor   = p.getEmotionalBalance() * 0.15;
        double physicalFactor    = p.getPhysicalActivity() * 0.10;
        double socialFactor      = p.getSocialEngagement() * 0.10;
        double mindfulFactor     = p.getMindfulness() * 0.10;

        p.setCoherenceScore(clamp(
                sleepFactor + stressManagement + focusLoadRatio + emotionalFactor
                        + physicalFactor + socialFactor + mindfulFactor));
    }

    // ========================================================
    // SCORECARD — strengths / weaknesses / balanced
    // ========================================================

    public void regenerateScorecard(NeuralProfile p) {
        Map<String, String> card = new LinkedHashMap<>();
        card.put("sleepQuality",       classify(p.getSleepQuality()));
        card.put("stressLevel",        classifyInverse(p.getStressLevel()));
        card.put("focusIndex",         classify(p.getFocusIndex()));
        card.put("emotionalBalance",   classify(p.getEmotionalBalance()));
        card.put("creativity",         classify(p.getCreativity()));
        card.put("analyticalThinking", classify(p.getAnalyticalThinking()));
        card.put("socialEngagement",   classify(p.getSocialEngagement()));
        card.put("physicalActivity",   classify(p.getPhysicalActivity()));
        card.put("mindfulness",        classify(p.getMindfulness()));
        card.put("cognitiveLoad",      classifyCognitive(p.getCognitiveLoad()));
        p.setScorecard(card);
    }

    private String classify(double val) {
        if (val >= 0.7) return ScorecardLevel.STRENGTH;
        if (val >= 0.4) return ScorecardLevel.BALANCED;
        return ScorecardLevel.WEAKNESS;
    }

    private String classifyInverse(double val) {
        if (val <= 0.3) return ScorecardLevel.STRENGTH;
        if (val <= 0.6) return ScorecardLevel.BALANCED;
        return ScorecardLevel.WEAKNESS;
    }

    private String classifyCognitive(double val) {
        if (val >= 0.8) return ScorecardLevel.WEAKNESS;
        if (val >= 0.5) return ScorecardLevel.BALANCED;
        return ScorecardLevel.STRENGTH;
    }

    // ========================================================
    // CONNECTIONS — default topology + dynamic strength
    // ========================================================

    public void regenerateConnections(NeuralProfile profile) {
        List<NeuralConnection> connections = new ArrayList<>();
        connections.add(new NeuralConnection("prefrontalCortex", "amygdala",       0.7,  "inhibitory"));
        connections.add(new NeuralConnection("prefrontalCortex", "hippocampus",    0.8,  "excitatory"));
        connections.add(new NeuralConnection("hippocampus",      "amygdala",       0.6,  "excitatory"));
        connections.add(new NeuralConnection("hypothalamus",     "amygdala",       0.75, "excitatory"));
        connections.add(new NeuralConnection("striatum",         "prefrontalCortex", 0.65, "excitatory"));
        connections.add(new NeuralConnection("cerebellum",       "parietalLobe",   0.5,  "excitatory"));
        connections.add(new NeuralConnection("temporalLobe",     "hippocampus",    0.7,  "excitatory"));
        connections.add(new NeuralConnection("occipitalLobe",    "parietalLobe",   0.6,  "excitatory"));
        connections.add(new NeuralConnection("thalamusLeft",     "prefrontalCortex", 0.7, "excitatory"));
        connections.add(new NeuralConnection("thalamusRight",    "temporalLobe",   0.65, "excitatory"));
        connections.add(new NeuralConnection("brainstem",        "hypothalamus",   0.8,  "excitatory"));
        connections.add(new NeuralConnection("brainstem",        "thalamusLeft",   0.75, "excitatory"));
        connections.add(new NeuralConnection("prefrontalCortex", "striatum",       0.6,  "excitatory"));
        connections.add(new NeuralConnection("amygdala",         "hypothalamus",   0.7,  "excitatory"));
        connections.add(new NeuralConnection("hippocampus",      "prefrontalCortex", 0.65, "excitatory"));
        profile.setConnections(connections);
    }

    public void recalculateConnections(NeuralProfile profile) {
        for (NeuralConnection conn : profile.getConnections()) {
            Double src = profile.getBrainRegions().getOrDefault(conn.getSourceRegion(), 0.5);
            Double tgt = profile.getBrainRegions().getOrDefault(conn.getTargetRegion(), 0.5);
            conn.setStrength(clamp((src + tgt) / 2.0 + 0.1));
        }
    }

    // ========================================================
    // HELPERS
    // ========================================================

    private boolean isKnowledgeWorker(String occupation) {
        if (occupation == null) return false;
        String lower = occupation.toLowerCase();
        return containsAny(lower, "engineer", "developer", "scientist", "analyst", "doctor", "lawyer",
                "researcher", "professor", "designer", "architect", "writer", "programmer", "student");
    }

    private static boolean containsAny(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }

    static double clamp(double val) {
        return Math.max(0.0, Math.min(1.0, val));
    }
}
