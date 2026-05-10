package com.maleneuro.service.messagetrigger;

import com.maleneuro.model.NeuralProfile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(7)
class AnalyticalTrigger extends KeywordMessageTrigger {

    AnalyticalTrigger() {
        super("analyze", "data", "logic", "math", "solve", "problem", "debug", "research");
    }

    @Override
    protected void applyEffects(NeuralProfile p) {
        p.setAnalyticalThinking(clamp(p.getAnalyticalThinking() + 0.08));
        bumpRegion(p, "parietalLobe", 0.08);
    }
}
