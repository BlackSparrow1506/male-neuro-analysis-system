package com.maleneuro.service.messagetrigger;

import com.maleneuro.model.NeuralProfile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(4)
class CreativityTrigger extends KeywordMessageTrigger {

    CreativityTrigger() {
        super("creative", "imagine", "art", "music", "design", "invent", "write", "compose", "draw");
    }

    @Override
    protected void applyEffects(NeuralProfile p) {
        p.setCreativity(clamp(p.getCreativity() + 0.08));
        bumpRegion(p, "temporalLobe", 0.08);
    }
}
