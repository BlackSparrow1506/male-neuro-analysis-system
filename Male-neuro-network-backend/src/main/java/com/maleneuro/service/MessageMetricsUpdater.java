package com.maleneuro.service;

import com.maleneuro.model.NeuralProfile;
import org.springframework.stereotype.Component;

/**
 * Adjusts a profile's metrics based on keywords detected in a chat message.
 * The math is intentionally simple — each topic nudges related metrics within
 * the [0, 1] range, then the calculator re-derives connections / coherence /
 * scorecard from the new values.
 *
 * Commit 2 of this refactor turns each topic into a {@code MessageTrigger}
 * Strategy so adding a new topic doesn't mean editing this class.
 */
@Component
public class MessageMetricsUpdater {

    private static final double DELTA_BUMP_LARGE = 0.10;
    private static final double DELTA_BUMP       = 0.08;
    private static final double DELTA_NUDGE      = 0.05;
    private static final double DELTA_TRIM       = 0.04;
    private static final double DELTA_TINY       = 0.03;

    public void apply(NeuralProfile profile, String message) {
        if (message == null || message.isBlank()) return;
        String lower = message.toLowerCase();

        if (containsAny(lower, "stress", "anxious", "worried", "nervous", "tense", "overwhelm", "panic", "burnout", "exhausted")) {
            bump(profile::getStressLevel,        profile::setStressLevel,        +DELTA_BUMP);
            bumpRegion(profile, "amygdala",      +DELTA_BUMP);
            bump(profile::getEmotionalBalance,   profile::setEmotionalBalance,   -DELTA_NUDGE);
        }
        if (containsAny(lower, "calm", "relax", "peace", "meditation", "breathe", "yoga", "mindful", "serene")) {
            bump(profile::getStressLevel,        profile::setStressLevel,        -DELTA_BUMP);
            bump(profile::getEmotionalBalance,   profile::setEmotionalBalance,   +DELTA_BUMP);
            bump(profile::getMindfulness,        profile::setMindfulness,        +DELTA_BUMP);
        }
        if (containsAny(lower, "focus", "concentrate", "study", "work", "code", "think", "deep work", "productive")) {
            bump(profile::getFocusIndex,         profile::setFocusIndex,         +DELTA_BUMP);
            bump(profile::getCognitiveLoad,      profile::setCognitiveLoad,      +DELTA_TRIM);
            bumpRegion(profile, "prefrontalCortex", +DELTA_BUMP);
        }
        if (containsAny(lower, "creative", "imagine", "art", "music", "design", "invent", "write", "compose", "draw")) {
            bump(profile::getCreativity,         profile::setCreativity,         +DELTA_BUMP);
            bumpRegion(profile, "temporalLobe",  +DELTA_BUMP);
        }
        if (containsAny(lower, "exercise", "gym", "run", "sport", "physical", "lift", "walk", "swim", "hike")) {
            bump(profile::getPhysicalActivity,   profile::setPhysicalActivity,   +DELTA_BUMP_LARGE);
            bumpRegion(profile, "cerebellum",    +DELTA_BUMP);
            bump(profile::getStressLevel,        profile::setStressLevel,        -DELTA_NUDGE);
        }
        if (containsAny(lower, "friend", "social", "talk", "party", "team", "people", "family", "connect", "hangout")) {
            bump(profile::getSocialEngagement,   profile::setSocialEngagement,   +DELTA_BUMP);
            bump(profile::getEmotionalBalance,   profile::setEmotionalBalance,   +DELTA_TINY);
        }
        if (containsAny(lower, "analyze", "data", "logic", "math", "solve", "problem", "debug", "research")) {
            bump(profile::getAnalyticalThinking, profile::setAnalyticalThinking, +DELTA_BUMP);
            bumpRegion(profile, "parietalLobe",  +DELTA_BUMP);
        }
        if (containsAny(lower, "remember", "memory", "recall", "past", "nostalgia", "learn", "study")) {
            bumpRegion(profile, "hippocampus",   +DELTA_BUMP_LARGE);
        }
        if (containsAny(lower, "sleep", "tired", "insomnia", "rest", "nap", "fatigue")) {
            if (containsAny(lower, "can't sleep", "insomnia", "tired", "fatigue", "bad sleep")) {
                bump(profile::getSleepQuality,   profile::setSleepQuality,       -DELTA_BUMP_LARGE);
            } else {
                bump(profile::getSleepQuality,   profile::setSleepQuality,       +DELTA_NUDGE);
            }
        }
        if (containsAny(lower, "sad", "depress", "lonely", "hopeless", "empty", "cry", "unmotivated")) {
            bump(profile::getEmotionalBalance,   profile::setEmotionalBalance,   -DELTA_BUMP_LARGE);
            bump(profile::getStressLevel,        profile::setStressLevel,        +DELTA_NUDGE);
        }
        if (containsAny(lower, "happy", "joy", "grateful", "excite", "motivated", "inspired", "proud")) {
            bump(profile::getEmotionalBalance,   profile::setEmotionalBalance,   +DELTA_BUMP);
            bump(profile::getStressLevel,        profile::setStressLevel,        -DELTA_TINY);
        }
    }

    private interface DoubleGetter { double get(); }
    private interface DoubleSetter { void set(double v); }

    private static void bump(DoubleGetter getter, DoubleSetter setter, double delta) {
        setter.set(clamp(getter.get() + delta));
    }

    private static void bumpRegion(NeuralProfile profile, String region, double delta) {
        profile.getBrainRegions().merge(region, delta, (a, b) -> clamp(a + b));
    }

    private static double clamp(double val) {
        return Math.max(0.0, Math.min(1.0, val));
    }

    private static boolean containsAny(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }
}
