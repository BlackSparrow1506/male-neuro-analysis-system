package com.maleneuro.controller;

import com.maleneuro.model.NeuralProfile;
import com.maleneuro.service.GitaService;
import com.maleneuro.service.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/gita")
public class GitaController {

    private final GitaService gitaService;
    private final ProfileService profileService;

    public GitaController(GitaService gitaService, ProfileService profileService) {
        this.gitaService = gitaService;
        this.profileService = profileService;
    }

    @GetMapping("/{profileId}/guidance")
    public ResponseEntity<Map<String, Object>> getGuidance(
            @AuthenticationPrincipal String userId,
            @PathVariable String profileId) {
        NeuralProfile profile = profileService.get(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!userId.equals(profile.getUserId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(gitaService.generateGuidance(profile));
    }

    @PostMapping("/translate")
    public ResponseEntity<Map<String, String>> translate(
            @AuthenticationPrincipal String userId,
            @RequestBody Map<String, String> body) {
        String text = body.get("text");
        String language = body.get("language");
        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(Map.of("text", gitaService.translate(text, language)));
    }
}
