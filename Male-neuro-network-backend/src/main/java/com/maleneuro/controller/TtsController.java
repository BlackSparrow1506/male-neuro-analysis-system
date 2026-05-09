package com.maleneuro.controller;

import com.maleneuro.config.ExternalApis;
import com.maleneuro.model.AuditLog;
import com.maleneuro.service.AuditLogService;
import com.maleneuro.service.RateLimitService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tts")
public class TtsController {

    private static final Logger log = LoggerFactory.getLogger(TtsController.class);
    private static final String ACTION = "tts";
    private static final Duration WINDOW = Duration.ofMinutes(1);

    private static final String ELEVENLABS_URL =
            ExternalApis.ElevenLabs.ttsUrl(ExternalApis.ElevenLabs.DEFAULT_VOICE_ID);

    private final RestTemplate restTemplate = new RestTemplate();
    private final AuditLogService auditLogService;
    private final RateLimitService rateLimitService;
    private final String apiKey;
    private final long perMinute;

    public TtsController(AuditLogService auditLogService,
                         RateLimitService rateLimitService,
                         @Value("${elevenlabs.api.key:}") String apiKey,
                         @Value("${app.ratelimit.tts.per-minute:30}") long perMinute) {
        this.auditLogService = auditLogService;
        this.rateLimitService = rateLimitService;
        this.apiKey = apiKey;
        this.perMinute = perMinute;
    }

    @PostMapping
    public ResponseEntity<?> synthesize(@AuthenticationPrincipal String userId,
                                        @RequestBody Map<String, String> req) {
        String text = req.get("text");
        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (apiKey == null || apiKey.isBlank()) {
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
            HttpHeaders headers = new HttpHeaders();
            headers.set("xi-api-key", apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(List.of(MediaType.parseMediaType(ExternalApis.ElevenLabs.AUDIO_MIME)));

            Map<String, Object> body = Map.of(
                    "text", text,
                    "model_id", ExternalApis.ElevenLabs.DEFAULT_MODEL,
                    "voice_settings", Map.of(
                            "stability", 0.45,
                            "similarity_boost", 0.80,
                            "style", 0.15,
                            "use_speaker_boost", true
                    )
            );

            ResponseEntity<byte[]> response = restTemplate.exchange(
                    ELEVENLABS_URL,
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    byte[].class
            );

            byte[] audio = response.getBody();
            HttpHeaders out = RateLimitResponses.rateLimitHeaders(decision);
            out.setContentType(MediaType.parseMediaType(ExternalApis.ElevenLabs.AUDIO_MIME));
            audioBytes = audio == null ? 0 : audio.length;
            success = true;
            return ResponseEntity.ok().headers(out).body(audio);

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
