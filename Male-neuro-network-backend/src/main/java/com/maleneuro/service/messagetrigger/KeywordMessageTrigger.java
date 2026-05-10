package com.maleneuro.service.messagetrigger;

import com.maleneuro.model.NeuralProfile;

import java.util.List;

/**
 * Base class that matches on any of a fixed list of substrings. Concrete
 * triggers implement {@link #applyEffects(NeuralProfile)} for the math.
 */
abstract class KeywordMessageTrigger implements MessageTrigger {

    private final List<String> keywords;

    protected KeywordMessageTrigger(String... keywords) {
        this.keywords = List.of(keywords);
    }

    @Override
    public final boolean matches(String lowerMessage) {
        for (String kw : keywords) {
            if (lowerMessage.contains(kw)) return true;
        }
        return false;
    }

    @Override
    public final void apply(NeuralProfile profile, String lowerMessage) {
        applyEffects(profile);
    }

    protected abstract void applyEffects(NeuralProfile profile);

    // ---- Shared math helpers ----

    protected static double clamp(double val) {
        return Math.max(0.0, Math.min(1.0, val));
    }

    protected static void bumpRegion(NeuralProfile profile, String region, double delta) {
        profile.getBrainRegions().merge(region, delta, (a, b) -> clamp(a + b));
    }
}
