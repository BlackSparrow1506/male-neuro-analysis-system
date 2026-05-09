package com.maleneuro.service;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fixed-window per-user rate limiter. Each (userId, action) pair gets an
 * independent counter that resets at the end of its window.
 *
 * The bucket map lives in memory — fine for a single backend instance, which is
 * what we run on Render today. Once we move to multi-instance, this swaps for a
 * Redis-backed implementation behind the same interface.
 */
@Service
public class RateLimitService {

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    public Decision tryAcquire(String userId, String action, long capacity, Duration window) {
        String key = userId + ":" + action;
        Window state = windows.computeIfAbsent(key, k -> new Window(Instant.now()));
        synchronized (state) {
            Instant now = Instant.now();
            Instant windowEnd = state.windowStart.plus(window);
            if (!now.isBefore(windowEnd)) {
                state.count = 0;
                state.windowStart = now;
                windowEnd = state.windowStart.plus(window);
            }
            if (state.count >= capacity) {
                long retryAfterSec = Math.max(1, Duration.between(now, windowEnd).toSeconds());
                return new Decision(false, capacity, 0, windowEnd, retryAfterSec);
            }
            state.count++;
            long remaining = capacity - state.count;
            return new Decision(true, capacity, remaining, windowEnd, 0);
        }
    }

    public record Decision(boolean allowed, long limit, long remaining, Instant resetAt, long retryAfterSeconds) {}

    private static final class Window {
        long count;
        Instant windowStart;

        Window(Instant windowStart) {
            this.windowStart = windowStart;
            this.count = 0;
        }
    }
}
