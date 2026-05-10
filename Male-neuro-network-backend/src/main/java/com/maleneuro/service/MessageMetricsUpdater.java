package com.maleneuro.service;

import com.maleneuro.model.NeuralProfile;
import com.maleneuro.service.messagetrigger.MessageTrigger;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Thin coordinator that runs every {@link MessageTrigger} against a chat
 * message in {@code @Order} order. Spring autowires the full list of trigger
 * beans, so adding a new topic is "drop in a class" — Open/Closed.
 *
 * The list order matters: clamping to [0,1] makes some sequences
 * non-commutative (e.g. {@code stress + 0.08} then {@code stress - 0.08} from
 * a stress→calm message lands at a different point than the reverse).
 * Triggers carry an {@link org.springframework.core.annotation.Order} value
 * to lock the execution order to the legacy implementation.
 */
@Component
public class MessageMetricsUpdater {

    private final List<MessageTrigger> triggers;

    public MessageMetricsUpdater(List<MessageTrigger> triggers) {
        this.triggers = triggers;
    }

    public void apply(NeuralProfile profile, String message) {
        if (message == null || message.isBlank()) return;
        String lower = message.toLowerCase();
        for (MessageTrigger trigger : triggers) {
            if (trigger.matches(lower)) {
                trigger.apply(profile, lower);
            }
        }
    }
}
