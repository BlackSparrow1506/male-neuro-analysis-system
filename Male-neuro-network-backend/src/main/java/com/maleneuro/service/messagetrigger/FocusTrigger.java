package com.maleneuro.service.messagetrigger;

import com.maleneuro.model.NeuralProfile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(3)
class FocusTrigger extends KeywordMessageTrigger {

    FocusTrigger() {
        super("focus", "concentrate", "study", "work", "code", "think", "deep work", "productive");
    }

    @Override
    protected void applyEffects(NeuralProfile p) {
        p.setFocusIndex(clamp(p.getFocusIndex() + 0.08));
        p.setCognitiveLoad(clamp(p.getCognitiveLoad() + 0.04));
        bumpRegion(p, "prefrontalCortex", 0.08);
    }
}
