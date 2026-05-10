package com.maleneuro.controller;

import com.maleneuro.model.NeuralProfile;
import com.maleneuro.service.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @PostMapping
    public ResponseEntity<NeuralProfile> createProfile(@AuthenticationPrincipal String userId,
                                                       @RequestBody NeuralProfile profile) {
        profile.setId(null);
        profile.setUserId(userId);
        return ResponseEntity.ok(profileService.create(profile));
    }

    @GetMapping
    public ResponseEntity<List<NeuralProfile>> getAllProfiles(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(profileService.getByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NeuralProfile> getProfile(@AuthenticationPrincipal String userId,
                                                    @PathVariable String id) {
        return profileService.get(id)
                .filter(p -> userId.equals(p.getUserId()))
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NeuralProfile> updateProfile(@AuthenticationPrincipal String userId,
                                                       @PathVariable String id,
                                                       @RequestBody NeuralProfile profile) {
        NeuralProfile existing = profileService.get(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!userId.equals(existing.getUserId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(profileService.update(id, profile));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfile(@AuthenticationPrincipal String userId,
                                              @PathVariable String id) {
        NeuralProfile existing = profileService.get(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!userId.equals(existing.getUserId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        profileService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
