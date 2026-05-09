package com.maleneuro.controller;

import com.maleneuro.service.RateLimitService.Decision;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

/** Helpers for translating a rate-limit decision into HTTP response headers and bodies. */
final class RateLimitResponses {

    static final String LIMIT_HEADER     = "X-RateLimit-Limit";
    static final String REMAINING_HEADER = "X-RateLimit-Remaining";
    static final String RESET_HEADER     = "X-RateLimit-Reset";

    private RateLimitResponses() {}

    static HttpHeaders rateLimitHeaders(Decision d) {
        HttpHeaders h = new HttpHeaders();
        h.set(LIMIT_HEADER, Long.toString(d.limit()));
        h.set(REMAINING_HEADER, Long.toString(Math.max(0, d.remaining())));
        h.set(RESET_HEADER, Long.toString(d.resetAt().getEpochSecond()));
        return h;
    }

    static ResponseEntity<Object> tooManyRequests(Decision d) {
        HttpHeaders headers = rateLimitHeaders(d);
        headers.set(HttpHeaders.RETRY_AFTER, Long.toString(d.retryAfterSeconds()));
        Map<String, Object> body = Map.of(
                "error", "RATE_LIMITED",
                "message", "Too many requests. Try again in " + d.retryAfterSeconds() + " seconds.",
                "retryAfterSeconds", d.retryAfterSeconds(),
                "limit", d.limit()
        );
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).headers(headers).body(body);
    }
}
