package com.maleneuro.service.messagetrigger;

import com.maleneuro.model.NeuralProfile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Sleep trigger has two sub-paths: when negative-sleep keywords are present,
 * sleep quality drops; otherwise generic sleep talk nudges it up.
 */
@Component
@Order(9)
class SleepTrigger implements MessageTrigger {

    private static final double NEGATIVE_DELTA = -0.10;
    private static final double POSITIVE_DELTA = 0.05;

    private static final List<String> ANY_SLEEP_TERMS =
            List.of("sleep", "tired", "insomnia", "rest", "nap", "fatigue");

    private static final List<String> NEGATIVE_SLEEP_TERMS =
            List.of("can't sleep", "insomnia", "tired", "fatigue", "bad sleep");

    @Override
    public boolean matches(String lowerMessage) {
        for (String kw : ANY_SLEEP_TERMS) {
            if (lowerMessage.contains(kw)) return true;
        }
        return false;
    }

    @Override
    public void apply(NeuralProfile p, String lowerMessage) {
        double delta = isNegative(lowerMessage) ? NEGATIVE_DELTA : POSITIVE_DELTA;
        p.setSleepQuality(clamp(p.getSleepQuality() + delta));
    }

    private boolean isNegative(String lowerMessage) {
        for (String kw : NEGATIVE_SLEEP_TERMS) {
            if (lowerMessage.contains(kw)) return true;
        }
        return false;
    }

    private static double clamp(double val) {
        return Math.max(0.0, Math.min(1.0, val));
    }
}
