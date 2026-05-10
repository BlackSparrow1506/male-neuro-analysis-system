package com.maleneuro.service.messagetrigger;

import com.maleneuro.model.NeuralProfile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(6)
class SocialTrigger extends KeywordMessageTrigger {

    SocialTrigger() {
        super("friend", "social", "talk", "party", "team", "people", "family", "connect", "hangout");
    }

    @Override
    protected void applyEffects(NeuralProfile p) {
        p.setSocialEngagement(clamp(p.getSocialEngagement() + 0.08));
        p.setEmotionalBalance(clamp(p.getEmotionalBalance() + 0.03));
    }
}
