package com.maleneuro.config;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CircuitBreakerLogging {

    private static final Logger log = LoggerFactory.getLogger(CircuitBreakerLogging.class);

    private final CircuitBreakerRegistry registry;

    public CircuitBreakerLogging(CircuitBreakerRegistry registry) {
        this.registry = registry;
    }

    @PostConstruct
    void registerListeners() {
        registry.getEventPublisher().onEntryAdded(event -> attach(event.getAddedEntry()));
        registry.getAllCircuitBreakers().forEach(this::attach);
    }

    private void attach(CircuitBreaker breaker) {
        breaker.getEventPublisher().onStateTransition(event -> log.warn(
                "CircuitBreaker[{}] {} -> {}",
                event.getCircuitBreakerName(),
                event.getStateTransition().getFromState(),
                event.getStateTransition().getToState()));

        breaker.getEventPublisher().onCallNotPermitted(event -> log.warn(
                "CircuitBreaker[{}] short-circuited a call (state OPEN)",
                event.getCircuitBreakerName()));
    }
}
