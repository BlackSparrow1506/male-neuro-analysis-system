package com.maleneuro.service.messagetrigger;

import com.maleneuro.model.NeuralProfile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(5)
class ExerciseTrigger extends KeywordMessageTrigger {

    ExerciseTrigger() {
        super("exercise", "gym", "run", "sport", "physical", "lift", "walk", "swim", "hike");
    }

    @Override
    protected void applyEffects(NeuralProfile p) {
        p.setPhysicalActivity(clamp(p.getPhysicalActivity() + 0.10));
        bumpRegion(p, "cerebellum", 0.08);
        p.setStressLevel(clamp(p.getStressLevel() - 0.05));
    }
}
