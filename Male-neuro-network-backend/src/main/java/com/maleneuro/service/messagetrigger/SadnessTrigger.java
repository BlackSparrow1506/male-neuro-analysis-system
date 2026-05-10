package com.maleneuro.service.messagetrigger;

import com.maleneuro.model.NeuralProfile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(10)
class SadnessTrigger extends KeywordMessageTrigger {

    SadnessTrigger() {
        super("sad", "depress", "lonely", "hopeless", "empty", "cry", "unmotivated");
    }

    @Override
    protected void applyEffects(NeuralProfile p) {
        p.setEmotionalBalance(clamp(p.getEmotionalBalance() - 0.10));
        p.setStressLevel(clamp(p.getStressLevel() + 0.05));
    }
}
