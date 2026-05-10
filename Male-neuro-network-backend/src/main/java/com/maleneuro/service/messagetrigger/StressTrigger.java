package com.maleneuro.service.messagetrigger;

import com.maleneuro.model.NeuralProfile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(1)
class StressTrigger extends KeywordMessageTrigger {

    StressTrigger() {
        super("stress", "anxious", "worried", "nervous", "tense", "overwhelm", "panic", "burnout", "exhausted");
    }

    @Override
    protected void applyEffects(NeuralProfile p) {
        p.setStressLevel(clamp(p.getStressLevel() + 0.08));
        bumpRegion(p, "amygdala", 0.08);
        p.setEmotionalBalance(clamp(p.getEmotionalBalance() - 0.05));
    }
}
