package com.maleneuro.controller;

import com.maleneuro.config.ExternalApis;
import com.maleneuro.model.AuditLog;
import com.maleneuro.service.AuditLogService;
import com.maleneuro.service.RateLimitService;
import com.maleneuro.service.TtsService;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/tts")
public class TtsController {

    private static final Logger log = LoggerFactory.getLogger(TtsController.class);
    private static final String ACTION = "tts";
    private static final Duration WINDOW = Duration.ofMinutes(1);

    private final TtsService ttsService;
    private final AuditLogService auditLogService;
    private final RateLimitService rateLimitService;
    private final long perMinute;

    public TtsController(TtsService ttsService,
                         AuditLogService auditLogService,
                         RateLimitService rateLimitService,
                         @Value("${app.ratelimit.tts.per-minute:30}") long perMinute) {
        this.ttsService = ttsService;
        this.auditLogService = auditLogService;
        this.rateLimitService = rateLimitService;
        this.perMinute = perMinute;
    }

    @PostMapping
    public ResponseEntity<?> synthesize(@AuthenticationPrincipal String userId,
                                        @RequestBody Map<String, String> req) {
        String text = req.get("text");
        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (!ttsService.isConfigured()) {
            log.warn("ElevenLabs API key not configured");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }

        RateLimitService.Decision decision = rateLimitService.tryAcquire(userId, ACTION, perMinute, WINDOW);
        if (!decision.allowed()) {
            recordRateLimitedAudit(userId, text, decision);
            return RateLimitResponses.tooManyRequests(decision);
        }

        // Truncate to 500 chars to preserve free quota
        if (text.length() > 500) text = text.substring(0, 497) + "...";

        long started = System.currentTimeMillis();
        boolean success = false;
        String errorMessage = null;
        int audioBytes = 0;
        try {
            byte[] audio = ttsService.synthesize(text);
            audioBytes = audio == null ? 0 : audio.length;
            success = true;
            HttpHeaders out = RateLimitResponses.rateLimitHeaders(decision);
            out.setContentType(MediaType.parseMediaType(ExternalApis.ElevenLabs.AUDIO_MIME));
            return ResponseEntity.ok().headers(out).body(audio);

        } catch (CallNotPermittedException e) {
            errorMessage = "circuit breaker open: " + e.getMessage();
            log.warn("ElevenLabs circuit breaker open — short-circuiting request");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                    "error", "UPSTREAM_UNAVAILABLE",
                    "message", "Voice service is temporarily unavailable. Try again in a moment."
            ));

        } catch (Exception e) {
            errorMessage = e.getMessage();
            log.error("ElevenLabs TTS failed: {}", errorMessage);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();

        } finally {
            AuditLog entry = new AuditLog();
            entry.setUserId(userId);
            entry.setAction("tts.synthesize");
            entry.setRequestPreview(text);
            entry.setResponsePreview(success ? audioBytes + " bytes audio" : null);
            entry.setLatencyMs(System.currentTimeMillis() - started);
            entry.setSuccess(success);
            entry.setErrorMessage(errorMessage);
            entry.setModel("elevenlabs");
            auditLogService.record(entry);
        }
    }

    private void recordRateLimitedAudit(String userId, String text, RateLimitService.Decision d) {
        AuditLog entry = new AuditLog();
        entry.setUserId(userId);
        entry.setAction("tts.rate_limited");
        entry.setRequestPreview(text);
        entry.setSuccess(false);
        entry.setErrorMessage("Rate limit exceeded — retry after " + d.retryAfterSeconds() + "s (limit " + d.limit() + "/min)");
        auditLogService.record(entry);
    }
}
