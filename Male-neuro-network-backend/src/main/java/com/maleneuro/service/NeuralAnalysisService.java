package com.maleneuro.service;

import com.maleneuro.model.AuditLog;
import com.maleneuro.model.ChatMessage;
import com.maleneuro.model.ChatRole;
import com.maleneuro.model.NeuralConnection;
import com.maleneuro.model.NeuralProfile;
import com.maleneuro.model.ScorecardLevel;
import com.maleneuro.repository.ChatMessageRepository;
import com.maleneuro.repository.NeuralProfileRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NeuralAnalysisService {

    private final NeuralProfileRepository profileRepo;
    private final ChatMessageRepository chatRepo;
    private final GeminiService geminiService;
    private final AuditLogService auditLogService;
    private final GuardrailService guardrailService;

    public NeuralAnalysisService(NeuralProfileRepository profileRepo,
                                  ChatMessageRepository chatRepo,
                                  GeminiService geminiService,
                                  AuditLogService auditLogService,
                                  GuardrailService guardrailService) {
        this.profileRepo = profileRepo;
        this.chatRepo = chatRepo;
        this.geminiService = geminiService;
        this.auditLogService = auditLogService;
        this.guardrailService = guardrailService;
    }

    // --- Profile CRUD ---

    public NeuralProfile createProfile(NeuralProfile profile) {
        profile.setCreatedAt(Instant.now());
        profile.setUpdatedAt(Instant.now());
        calculateInitialMetrics(profile);
        generateDefaultConnections(profile);
        calculateCoherence(profile);
        generateScorecard(profile);
        return profileRepo.save(profile);
    }

    public List<NeuralProfile> getAllProfiles() {
        return profileRepo.findAll();
    }

    public List<NeuralProfile> getProfilesByUser(String userId) {
        return profileRepo.findByUserId(userId);
    }

    public Optional<NeuralProfile> getProfile(String id) {
        return profileRepo.findById(id);
    }

    public NeuralProfile updateProfile(String id, NeuralProfile updates) {
        NeuralProfile existing = profileRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found: " + id));

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

        calculateInitialMetrics(existing);
        recalculateConnections(existing);
        calculateCoherence(existing);
        generateScorecard(existing);
        existing.setUpdatedAt(Instant.now());
        return profileRepo.save(existing);
    }

    public void deleteProfile(String id) {
        chatRepo.deleteByProfileId(id);
        profileRepo.deleteById(id);
    }

    public void clearChatHistory(String profileId) {
        chatRepo.deleteByProfileId(profileId);
    }

    // --- Chat / Analysis ---

    public ChatMessage analyzeMessage(String profileId, String userMessage) {
        NeuralProfile profile = profileRepo.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found: " + profileId));

        // Fetch prior history BEFORE saving the current message to avoid duplication in AI context
        List<ChatMessage> priorHistory = chatRepo
                .findTop50ByProfileIdOrderByTimestampDesc(profileId)
                .stream()
                .sorted(Comparator.comparing(ChatMessage::getTimestamp))
                .collect(Collectors.toList());

        chatRepo.save(new ChatMessage(profileId, ChatRole.USER.wire(), userMessage));

        updateMetricsFromMessage(profile, userMessage);
        recalculateConnections(profile);
        calculateCoherence(profile);
        generateScorecard(profile);
        profile.setUpdatedAt(Instant.now());
        profileRepo.save(profile);

        long started = System.currentTimeMillis();
        String response = null;
        boolean success = false;
        String errorMessage = null;
        List<String> redactedKinds = List.of();
        try {
            String raw = geminiService.generateResponse(profile, priorHistory, userMessage);
            GuardrailService.OutputFilter filter = guardrailService.filterOutput(raw);
            response = filter.text();
            redactedKinds = filter.redactedKinds();
            success = true;
            ChatMessage aiMessage = new ChatMessage(profileId, ChatRole.ASSISTANT.wire(), response);
            return chatRepo.save(aiMessage);
        } catch (RuntimeException ex) {
            errorMessage = ex.getMessage();
            throw ex;
        } finally {
            AuditLog entry = new AuditLog();
            entry.setUserId(profile.getUserId());
            entry.setProfileId(profileId);
            entry.setAction(redactedKinds.isEmpty() ? "chat.message" : "chat.flagged");
            entry.setRequestPreview(userMessage);
            entry.setResponsePreview(response);
            entry.setLatencyMs(System.currentTimeMillis() - started);
            entry.setSuccess(success);
            if (errorMessage != null) {
                entry.setErrorMessage(errorMessage);
            } else if (!redactedKinds.isEmpty()) {
                entry.setErrorMessage("PII redacted from response: " + String.join(", ", redactedKinds));
            }
            entry.setModel("groq");
            auditLogService.record(entry);
        }
    }

    public List<ChatMessage> getChatHistory(String profileId) {
        return chatRepo.findByProfileIdOrderByTimestampAsc(profileId);
    }

    // ========================================================
    // INITIAL METRICS — calculated from lifestyle data
    // ========================================================

    private void calculateInitialMetrics(NeuralProfile p) {
        // --- Stress Level ---
        double stress = 0.4; // baseline
        if ("work".equals(p.getStressSource()) || "finances".equals(p.getStressSource())) stress += 0.15;
        if ("academic".equals(p.getStressSource())) stress += 0.1;
        if (p.getSleepHours() < 6) stress += 0.15;
        if (p.getSleepHours() >= 7 && p.getSleepHours() <= 9) stress -= 0.1;
        if (p.getScreenTimeHours() > 8) stress += 0.1;
        if (p.getCaffeineIntake() > 4) stress += 0.1;
        if ("anxious".equals(p.getMoodBaseline())) stress += 0.15;
        if ("calm".equals(p.getMoodBaseline())) stress -= 0.15;
        if (p.isMeditates()) stress -= 0.1;
        p.setStressLevel(clamp(stress));

        // --- Focus Index ---
        double focus = 0.4;
        if (p.isMeditates()) focus += 0.15;
        if (p.isReadsRegularly()) focus += 0.1;
        if (p.getSleepHours() >= 7) focus += 0.1;
        if (p.getScreenTimeHours() > 10) focus -= 0.15;
        if (p.getCaffeineIntake() >= 1 && p.getCaffeineIntake() <= 3) focus += 0.05;
        if (p.getCaffeineIntake() > 5) focus -= 0.1;
        if (isKnowledgeWorker(p.getOccupation())) focus += 0.1;
        p.setFocusIndex(clamp(focus));

        // --- Cognitive Load ---
        double cognitive = 0.4;
        if (isKnowledgeWorker(p.getOccupation())) cognitive += 0.15;
        if (p.isReadsRegularly()) cognitive += 0.1;
        if ("analytical".equals(p.getHobbyType())) cognitive += 0.1;
        if (p.getSleepHours() < 5) cognitive -= 0.1;
        p.setCognitiveLoad(clamp(cognitive));

        // --- Emotional Balance ---
        double emotional = 0.5;
        if (p.isMeditates()) emotional += 0.15;
        if ("active".equals(p.getSocialLife()) || "very_active".equals(p.getSocialLife())) emotional += 0.1;
        if ("isolated".equals(p.getSocialLife())) emotional -= 0.15;
        if ("in_relationship".equals(p.getRelationshipStatus()) || "married".equals(p.getRelationshipStatus())) emotional += 0.05;
        if ("calm".equals(p.getMoodBaseline())) emotional += 0.1;
        if ("low".equals(p.getMoodBaseline())) emotional -= 0.15;
        if (p.getSleepHours() >= 7) emotional += 0.05;
        p.setEmotionalBalance(clamp(emotional));

        // --- Creativity ---
        double creativity = 0.35;
        if ("creative".equals(p.getHobbyType())) creativity += 0.2;
        if (p.isHasHobbies()) creativity += 0.1;
        if (p.getSleepHours() >= 7) creativity += 0.05;
        if ("low".equals(p.getMoodBaseline()) || "anxious".equals(p.getMoodBaseline())) creativity -= 0.1;
        if (p.isReadsRegularly()) creativity += 0.1;
        p.setCreativity(clamp(creativity));

        // --- Analytical Thinking ---
        double analytical = 0.4;
        if (isKnowledgeWorker(p.getOccupation())) analytical += 0.15;
        if ("analytical".equals(p.getHobbyType())) analytical += 0.15;
        if (p.isReadsRegularly()) analytical += 0.1;
        p.setAnalyticalThinking(clamp(analytical));

        // --- Social Engagement ---
        double social = 0.3;
        switch (p.getSocialLife() != null ? p.getSocialLife() : "") {
            case "very_active" -> social = 0.9;
            case "active" -> social = 0.7;
            case "moderate" -> social = 0.5;
            case "limited" -> social = 0.3;
            case "isolated" -> social = 0.1;
        }
        if ("social".equals(p.getHobbyType())) social += 0.1;
        p.setSocialEngagement(clamp(social));

        // --- Physical Activity ---
        double physical = 0.2;
        if (p.getExerciseFrequency() >= 5) physical = 0.85;
        else if (p.getExerciseFrequency() >= 3) physical = 0.65;
        else if (p.getExerciseFrequency() >= 1) physical = 0.4;
        if ("physical".equals(p.getHobbyType())) physical += 0.1;
        p.setPhysicalActivity(clamp(physical));

        // --- Sleep Quality ---
        double sleep = 0.5;
        if (p.getSleepHours() >= 7 && p.getSleepHours() <= 9) sleep = 0.85;
        else if (p.getSleepHours() >= 6) sleep = 0.6;
        else if (p.getSleepHours() < 5) sleep = 0.2;
        if (p.getScreenTimeHours() > 8) sleep -= 0.1;
        if (p.getCaffeineIntake() > 3) sleep -= 0.1;
        if (p.isMeditates()) sleep += 0.1;
        p.setSleepQuality(clamp(sleep));

        // --- Mindfulness ---
        double mindfulness = 0.2;
        if (p.isMeditates()) mindfulness += 0.35;
        if (p.isReadsRegularly()) mindfulness += 0.1;
        if ("calm".equals(p.getMoodBaseline())) mindfulness += 0.1;
        if (p.getExerciseFrequency() >= 3) mindfulness += 0.05;
        p.setMindfulness(clamp(mindfulness));

        // --- Brain region activity from lifestyle ---
        Map<String, Double> regions = p.getBrainRegions();
        regions.put("prefrontalCortex", clamp(0.4 + p.getFocusIndex() * 0.3 + p.getAnalyticalThinking() * 0.2));
        regions.put("amygdala", clamp(0.3 + p.getStressLevel() * 0.5));
        regions.put("hippocampus", clamp(0.4 + p.getMindfulness() * 0.2 + (p.isReadsRegularly() ? 0.15 : 0)));
        regions.put("cerebellum", clamp(0.3 + p.getPhysicalActivity() * 0.4));
        regions.put("hypothalamus", clamp(0.4 + p.getStressLevel() * 0.2 + (1.0 - p.getSleepQuality()) * 0.2));
        regions.put("striatum", clamp(0.3 + p.getCreativity() * 0.2 + p.getPhysicalActivity() * 0.15));
        regions.put("parietalLobe", clamp(0.35 + p.getAnalyticalThinking() * 0.3));
        regions.put("temporalLobe", clamp(0.35 + p.getCreativity() * 0.2 + p.getSocialEngagement() * 0.15));
        regions.put("occipitalLobe", clamp(0.4 + p.getScreenTimeHours() * 0.02));
        regions.put("brainstem", clamp(0.6 + p.getSleepQuality() * 0.2));
        regions.put("thalamusLeft", clamp(0.4 + p.getFocusIndex() * 0.2));
        regions.put("thalamusRight", clamp(0.4 + p.getEmotionalBalance() * 0.2));
    }

    // ========================================================
    // COHERENCE — weighted multi-factor calculation
    // ========================================================

    private void calculateCoherence(NeuralProfile p) {
        // Coherence = how well-balanced and optimally functioning the neural network is
        // Factors with weights:
        //   Sleep quality (20%) — foundation of brain health
        //   Stress management (20%) — inverse of stress, measures control
        //   Focus-to-load ratio (15%) — can you handle your cognitive demands?
        //   Emotional balance (15%) — stability of mood regulation
        //   Physical activity (10%) — BDNF and neuroplasticity
        //   Social connection (10%) — oxytocin and serotonin pathways
        //   Mindfulness (10%) — prefrontal cortex regulation strength

        double sleepFactor = p.getSleepQuality() * 0.20;
        double stressManagement = (1.0 - p.getStressLevel()) * 0.20;
        double focusLoadRatio = (p.getCognitiveLoad() > 0 ? Math.min(1.0, p.getFocusIndex() / Math.max(0.1, p.getCognitiveLoad())) : p.getFocusIndex()) * 0.15;
        double emotionalFactor = p.getEmotionalBalance() * 0.15;
        double physicalFactor = p.getPhysicalActivity() * 0.10;
        double socialFactor = p.getSocialEngagement() * 0.10;
        double mindfulFactor = p.getMindfulness() * 0.10;

        double coherence = sleepFactor + stressManagement + focusLoadRatio + emotionalFactor + physicalFactor + socialFactor + mindfulFactor;
        p.setCoherenceScore(clamp(coherence));
    }

    // ========================================================
    // SCORECARD — strengths, weaknesses, balanced
    // ========================================================

    private void generateScorecard(NeuralProfile p) {
        Map<String, String> card = new LinkedHashMap<>();

        card.put("sleepQuality", classify(p.getSleepQuality()));
        card.put("stressLevel", classifyInverse(p.getStressLevel()));
        card.put("focusIndex", classify(p.getFocusIndex()));
        card.put("emotionalBalance", classify(p.getEmotionalBalance()));
        card.put("creativity", classify(p.getCreativity()));
        card.put("analyticalThinking", classify(p.getAnalyticalThinking()));
        card.put("socialEngagement", classify(p.getSocialEngagement()));
        card.put("physicalActivity", classify(p.getPhysicalActivity()));
        card.put("mindfulness", classify(p.getMindfulness()));
        card.put("cognitiveLoad", classifyCognitive(p.getCognitiveLoad()));

        p.setScorecard(card);
    }

    private String classify(double val) {
        if (val >= 0.7) return ScorecardLevel.STRENGTH;
        if (val >= 0.4) return ScorecardLevel.BALANCED;
        return ScorecardLevel.WEAKNESS;
    }

    private String classifyInverse(double val) {
        if (val <= 0.3) return ScorecardLevel.STRENGTH;
        if (val <= 0.6) return ScorecardLevel.BALANCED;
        return ScorecardLevel.WEAKNESS;
    }

    private String classifyCognitive(double val) {
        if (val >= 0.8) return ScorecardLevel.WEAKNESS; // overloaded
        if (val >= 0.5) return ScorecardLevel.BALANCED;
        return ScorecardLevel.STRENGTH; // low load = good
    }

    // ========================================================
    // MESSAGE ANALYSIS — update metrics from chat input
    // ========================================================

    private void updateMetricsFromMessage(NeuralProfile profile, String message) {
        String lower = message.toLowerCase();

        if (containsAny(lower, "stress", "anxious", "worried", "nervous", "tense", "overwhelm", "panic", "burnout", "exhausted")) {
            profile.setStressLevel(Math.min(1.0, profile.getStressLevel() + 0.08));
            profile.getBrainRegions().merge("amygdala", 0.08, (a, b) -> Math.min(1.0, a + b));
            profile.setEmotionalBalance(Math.max(0.0, profile.getEmotionalBalance() - 0.05));
        }
        if (containsAny(lower, "calm", "relax", "peace", "meditation", "breathe", "yoga", "mindful", "serene")) {
            profile.setStressLevel(Math.max(0.0, profile.getStressLevel() - 0.08));
            profile.setEmotionalBalance(Math.min(1.0, profile.getEmotionalBalance() + 0.08));
            profile.setMindfulness(Math.min(1.0, profile.getMindfulness() + 0.08));
        }
        if (containsAny(lower, "focus", "concentrate", "study", "work", "code", "think", "deep work", "productive")) {
            profile.setFocusIndex(Math.min(1.0, profile.getFocusIndex() + 0.08));
            profile.setCognitiveLoad(Math.min(1.0, profile.getCognitiveLoad() + 0.04));
            profile.getBrainRegions().merge("prefrontalCortex", 0.08, (a, b) -> Math.min(1.0, a + b));
        }
        if (containsAny(lower, "creative", "imagine", "art", "music", "design", "invent", "write", "compose", "draw")) {
            profile.setCreativity(Math.min(1.0, profile.getCreativity() + 0.08));
            profile.getBrainRegions().merge("temporalLobe", 0.08, (a, b) -> Math.min(1.0, a + b));
        }
        if (containsAny(lower, "exercise", "gym", "run", "sport", "physical", "lift", "walk", "swim", "hike")) {
            profile.setPhysicalActivity(Math.min(1.0, profile.getPhysicalActivity() + 0.1));
            profile.getBrainRegions().merge("cerebellum", 0.08, (a, b) -> Math.min(1.0, a + b));
            profile.setStressLevel(Math.max(0.0, profile.getStressLevel() - 0.05));
        }
        if (containsAny(lower, "friend", "social", "talk", "party", "team", "people", "family", "connect", "hangout")) {
            profile.setSocialEngagement(Math.min(1.0, profile.getSocialEngagement() + 0.08));
            profile.setEmotionalBalance(Math.min(1.0, profile.getEmotionalBalance() + 0.03));
        }
        if (containsAny(lower, "analyze", "data", "logic", "math", "solve", "problem", "debug", "research")) {
            profile.setAnalyticalThinking(Math.min(1.0, profile.getAnalyticalThinking() + 0.08));
            profile.getBrainRegions().merge("parietalLobe", 0.08, (a, b) -> Math.min(1.0, a + b));
        }
        if (containsAny(lower, "remember", "memory", "recall", "past", "nostalgia", "learn", "study")) {
            profile.getBrainRegions().merge("hippocampus", 0.1, (a, b) -> Math.min(1.0, a + b));
        }
        if (containsAny(lower, "sleep", "tired", "insomnia", "rest", "nap", "fatigue")) {
            if (containsAny(lower, "can't sleep", "insomnia", "tired", "fatigue", "bad sleep")) {
                profile.setSleepQuality(Math.max(0.0, profile.getSleepQuality() - 0.1));
            } else {
                profile.setSleepQuality(Math.min(1.0, profile.getSleepQuality() + 0.05));
            }
        }
        if (containsAny(lower, "sad", "depress", "lonely", "hopeless", "empty", "cry", "unmotivated")) {
            profile.setEmotionalBalance(Math.max(0.0, profile.getEmotionalBalance() - 0.1));
            profile.setStressLevel(Math.min(1.0, profile.getStressLevel() + 0.05));
        }
        if (containsAny(lower, "happy", "joy", "grateful", "excite", "motivated", "inspired", "proud")) {
            profile.setEmotionalBalance(Math.min(1.0, profile.getEmotionalBalance() + 0.08));
            profile.setStressLevel(Math.max(0.0, profile.getStressLevel() - 0.03));
        }
    }

    // ========================================================
    // HELPERS
    // ========================================================

    private void generateDefaultConnections(NeuralProfile profile) {
        List<NeuralConnection> connections = new ArrayList<>();
        connections.add(new NeuralConnection("prefrontalCortex", "amygdala", 0.7, "inhibitory"));
        connections.add(new NeuralConnection("prefrontalCortex", "hippocampus", 0.8, "excitatory"));
        connections.add(new NeuralConnection("hippocampus", "amygdala", 0.6, "excitatory"));
        connections.add(new NeuralConnection("hypothalamus", "amygdala", 0.75, "excitatory"));
        connections.add(new NeuralConnection("striatum", "prefrontalCortex", 0.65, "excitatory"));
        connections.add(new NeuralConnection("cerebellum", "parietalLobe", 0.5, "excitatory"));
        connections.add(new NeuralConnection("temporalLobe", "hippocampus", 0.7, "excitatory"));
        connections.add(new NeuralConnection("occipitalLobe", "parietalLobe", 0.6, "excitatory"));
        connections.add(new NeuralConnection("thalamusLeft", "prefrontalCortex", 0.7, "excitatory"));
        connections.add(new NeuralConnection("thalamusRight", "temporalLobe", 0.65, "excitatory"));
        connections.add(new NeuralConnection("brainstem", "hypothalamus", 0.8, "excitatory"));
        connections.add(new NeuralConnection("brainstem", "thalamusLeft", 0.75, "excitatory"));
        connections.add(new NeuralConnection("prefrontalCortex", "striatum", 0.6, "excitatory"));
        connections.add(new NeuralConnection("amygdala", "hypothalamus", 0.7, "excitatory"));
        connections.add(new NeuralConnection("hippocampus", "prefrontalCortex", 0.65, "excitatory"));
        profile.setConnections(connections);
    }

    private void recalculateConnections(NeuralProfile profile) {
        for (NeuralConnection conn : profile.getConnections()) {
            Double src = profile.getBrainRegions().getOrDefault(conn.getSourceRegion(), 0.5);
            Double tgt = profile.getBrainRegions().getOrDefault(conn.getTargetRegion(), 0.5);
            conn.setStrength(clamp((src + tgt) / 2.0 + 0.1));
        }
    }

    private boolean isKnowledgeWorker(String occupation) {
        if (occupation == null) return false;
        String lower = occupation.toLowerCase();
        return containsAny(lower, "engineer", "developer", "scientist", "analyst", "doctor", "lawyer",
                "researcher", "professor", "designer", "architect", "writer", "programmer", "student");
    }

    private double clamp(double val) {
        return Math.max(0.0, Math.min(1.0, val));
    }

    private boolean containsAny(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }
}
