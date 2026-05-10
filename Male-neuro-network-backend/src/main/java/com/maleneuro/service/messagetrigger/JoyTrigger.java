package com.maleneuro.service.messagetrigger;

import com.maleneuro.model.NeuralProfile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(11)
class JoyTrigger extends KeywordMessageTrigger {

    JoyTrigger() {
        super("happy", "joy", "grateful", "excite", "motivated", "inspired", "proud");
    }

    @Override
    protected void applyEffects(NeuralProfile p) {
        p.setEmotionalBalance(clamp(p.getEmotionalBalance() + 0.08));
        p.setStressLevel(clamp(p.getStressLevel() - 0.03));
    }
}
