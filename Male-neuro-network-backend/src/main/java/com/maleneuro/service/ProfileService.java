package com.maleneuro.service;

import com.maleneuro.model.NeuralProfile;
import com.maleneuro.repository.ChatMessageRepository;
import com.maleneuro.repository.NeuralProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Owns the profile lifecycle: create, read, update, delete, and chat-history
 * teardown. All metric math is delegated to {@link ProfileMetricsCalculator}
 * so this class only orchestrates persistence (Single Responsibility).
 */
@Service
public class ProfileService {

    private final NeuralProfileRepository profileRepo;
    private final ChatMessageRepository chatRepo;
    private final ProfileMetricsCalculator metrics;

    public ProfileService(NeuralProfileRepository profileRepo,
                          ChatMessageRepository chatRepo,
                          ProfileMetricsCalculator metrics) {
        this.profileRepo = profileRepo;
        this.chatRepo = chatRepo;
        this.metrics = metrics;
    }

    public NeuralProfile create(NeuralProfile profile) {
        profile.setCreatedAt(Instant.now());
        profile.setUpdatedAt(Instant.now());
        metrics.recomputeAll(profile);
        return profileRepo.save(profile);
    }

    public List<NeuralProfile> getAll() {
        return profileRepo.findAll();
    }

    public List<NeuralProfile> getByUser(String userId) {
        return profileRepo.findByUserId(userId);
    }

    public Optional<NeuralProfile> get(String id) {
        return profileRepo.findById(id);
    }

    public NeuralProfile update(String id, NeuralProfile updates) {
        NeuralProfile existing = profileRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found: " + id));
        applyEditableFields(existing, updates);
        metrics.recomputeAll(existing);
        existing.setUpdatedAt(Instant.now());
        return profileRepo.save(existing);
    }

    public void delete(String id) {
        chatRepo.deleteByProfileId(id);
        profileRepo.deleteById(id);
    }

    public void clearChatHistory(String profileId) {
        chatRepo.deleteByProfileId(profileId);
    }

    private void applyEditableFields(NeuralProfile existing, NeuralProfile updates) {
        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getAge() > 0) existing.setAge(updates.getAge());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        if (updates.getOccupation() != null) existing.setOccupation(updates.getOccupation());

        existing.setSleepHours(updates.getSleepHours());
        existing.setExerciseFrequency(updates.getExerciseFrequency());
        if (updates.getExerciseType() != null) existing.setExerciseType(updates.getExerciseType());
        if (updates.getDietQuality() != null) existing.setDietQuality(updates.getDietQuality());
        existing.setScreenTimeHours(updates.getScreenTimeHours());
        if (updates.getSocialLife() != null) existing.setSocialLife(updates.getSocialLife());
        if (updates.getStressSource() != null) existing.setStressSource(updates.getStressSource());
        if (updates.getPrimaryGoal() != null) existing.setPrimaryGoal(updates.getPrimaryGoal());
        existing.setMeditates(updates.isMeditates());
        existing.setReadsRegularly(updates.isReadsRegularly());
        if (updates.getMoodBaseline() != null) existing.setMoodBaseline(updates.getMoodBaseline());
        existing.setCaffeineIntake(updates.getCaffeineIntake());
        if (updates.getRelationshipStatus() != null) existing.setRelationshipStatus(updates.getRelationshipStatus());
        existing.setHasHobbies(updates.isHasHobbies());
        if (updates.getHobbyType() != null) existing.setHobbyType(updates.getHobbyType());
    }
}
