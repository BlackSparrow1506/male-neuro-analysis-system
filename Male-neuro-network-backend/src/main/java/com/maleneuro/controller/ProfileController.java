package com.maleneuro.controller;

import com.maleneuro.model.NeuralProfile;
import com.maleneuro.service.NeuralAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final NeuralAnalysisService analysisService;

    public ProfileController(NeuralAnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping
    public ResponseEntity<NeuralProfile> createProfile(@AuthenticationPrincipal String userId,
                                                       @RequestBody NeuralProfile profile) {
        profile.setId(null);
        profile.setUserId(userId);
        return ResponseEntity.ok(analysisService.createProfile(profile));
    }

    @GetMapping
    public ResponseEntity<List<NeuralProfile>> getAllProfiles(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(analysisService.getProfilesByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NeuralProfile> getProfile(@AuthenticationPrincipal String userId,
                                                    @PathVariable String id) {
        return analysisService.getProfile(id)
                .filter(p -> userId.equals(p.getUserId()))
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NeuralProfile> updateProfile(@AuthenticationPrincipal String userId,
                                                       @PathVariable String id,
                                                       @RequestBody NeuralProfile profile) {
        NeuralProfile existing = analysisService.getProfile(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!userId.equals(existing.getUserId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(analysisService.updateProfile(id, profile));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfile(@AuthenticationPrincipal String userId,
                                              @PathVariable String id) {
        NeuralProfile existing = analysisService.getProfile(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!userId.equals(existing.getUserId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        analysisService.deleteProfile(id);
        return ResponseEntity.noContent().build();
    }
}
