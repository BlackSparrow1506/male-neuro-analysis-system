package com.maleneuro.service.messagetrigger;

import com.maleneuro.model.NeuralProfile;

/**
 * Strategy: a single rule that may fire on a chat message and adjust the
 * profile's metrics. Spring discovers every {@code @Component} implementing
 * this interface and feeds them, in {@code @Order} order, to the
 * MessageMetricsUpdater.
 *
 * Adding a new topic now means adding one class — the updater never changes
 * (Open/Closed). Order is honoured because clamp([0,1]) makes some sequences
 * non-commutative; the original linear chain of {@code if (containsAny…)}
 * blocks fired in declaration order, and we preserve that here.
 *
 * {@link #apply} receives the lower-cased message in addition to the profile
 * because a few triggers (notably sleep) branch their effect on which
 * sub-keyword matched.
 */
public interface MessageTrigger {

    boolean matches(String lowerMessage);

    void apply(NeuralProfile profile, String lowerMessage);
}
