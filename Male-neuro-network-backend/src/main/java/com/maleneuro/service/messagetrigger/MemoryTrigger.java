package com.maleneuro.service.messagetrigger;

import com.maleneuro.model.NeuralProfile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(8)
class MemoryTrigger extends KeywordMessageTrigger {

    MemoryTrigger() {
        super("remember", "memory", "recall", "past", "nostalgia", "learn", "study");
    }

    @Override
    protected void applyEffects(NeuralProfile p) {
        bumpRegion(p, "hippocampus", 0.10);
    }
}
