package com.maleneuro.controller;

import com.maleneuro.model.ChatMessage;
import com.maleneuro.model.NeuralProfile;
import com.maleneuro.service.NeuralAnalysisService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final NeuralAnalysisService analysisService;

    public ChatController(NeuralAnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    private void assertOwnership(String userId, String profileId) {
        NeuralProfile profile = analysisService.getProfile(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!userId.equals(profile.getUserId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/{profileId}")
    public ResponseEntity<ChatMessage> sendMessage(
            @AuthenticationPrincipal String userId,
            @PathVariable String profileId,
            @RequestBody Map<String, String> body) {
        assertOwnership(userId, profileId);
        String message = body.get("message");
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(analysisService.analyzeMessage(profileId, message));
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
}
