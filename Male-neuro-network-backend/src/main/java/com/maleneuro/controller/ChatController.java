package com.maleneuro.controller;

import com.maleneuro.model.AuditLog;
import com.maleneuro.model.ChatMessage;
import com.maleneuro.model.NeuralProfile;
import com.maleneuro.service.AuditLogService;
import com.maleneuro.service.NeuralAnalysisService;
import com.maleneuro.service.RateLimitService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private static final String ACTION = "chat";
    private static final Duration WINDOW = Duration.ofMinutes(1);

    private final NeuralAnalysisService analysisService;
    private final RateLimitService rateLimitService;
    private final AuditLogService auditLogService;
    private final long perMinute;

    public ChatController(NeuralAnalysisService analysisService,
                          RateLimitService rateLimitService,
                          AuditLogService auditLogService,
                          @Value("${app.ratelimit.chat.per-minute:20}") long perMinute) {
        this.analysisService = analysisService;
        this.rateLimitService = rateLimitService;
        this.auditLogService = auditLogService;
        this.perMinute = perMinute;
    }

    private void assertOwnership(String userId, String profileId) {
        NeuralProfile profile = analysisService.getProfile(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!userId.equals(profile.getUserId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/{profileId}")
    public ResponseEntity<?> sendMessage(
            @AuthenticationPrincipal String userId,
            @PathVariable String profileId,
            @RequestBody Map<String, String> body) {
        assertOwnership(userId, profileId);
        String message = body.get("message");
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        RateLimitService.Decision decision = rateLimitService.tryAcquire(userId, ACTION, perMinute, WINDOW);
        if (!decision.allowed()) {
            recordRateLimitedAudit(userId, profileId, message, decision);
            return RateLimitResponses.tooManyRequests(decision);
        }

        ChatMessage reply = analysisService.analyzeMessage(profileId, message);
        return ResponseEntity.ok().headers(RateLimitResponses.rateLimitHeaders(decision)).body(reply);
    }

    @GetMapping("/{profileId}/history")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @AuthenticationPrincipal String userId,
            @PathVariable String profileId) {
        assertOwnership(userId, profileId);
        return ResponseEntity.ok(analysisService.getChatHistory(profileId));
    }

    @DeleteMapping("/{profileId}/history")
    public ResponseEntity<Void> clearChatHistory(
            @AuthenticationPrincipal String userId,
            @PathVariable String profileId) {
        assertOwnership(userId, profileId);
        analysisService.clearChatHistory(profileId);
        return ResponseEntity.noContent().build();
    }

    private void recordRateLimitedAudit(String userId, String profileId, String message, RateLimitService.Decision d) {
        AuditLog entry = new AuditLog();
        entry.setUserId(userId);
        entry.setProfileId(profileId);
        entry.setAction("chat.rate_limited");
        entry.setRequestPreview(message);
        entry.setSuccess(false);
        entry.setErrorMessage("Rate limit exceeded — retry after " + d.retryAfterSeconds() + "s (limit " + d.limit() + "/min)");
        auditLogService.record(entry);
    }
}
