package com.maleneuro.service.messagetrigger;

import com.maleneuro.model.NeuralProfile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(2)
class CalmTrigger extends KeywordMessageTrigger {

    CalmTrigger() {
        super("calm", "relax", "peace", "meditation", "breathe", "yoga", "mindful", "serene");
    }

    @Override
    protected void applyEffects(NeuralProfile p) {
        p.setStressLevel(clamp(p.getStressLevel() - 0.08));
        p.setEmotionalBalance(clamp(p.getEmotionalBalance() + 0.08));
        p.setMindfulness(clamp(p.getMindfulness() + 0.08));
    }
}
