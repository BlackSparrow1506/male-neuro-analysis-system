package com.maleneuro.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "neural_profiles")
public class NeuralProfile {

    @Id
    private String id;
    private String userId;   // owning user's ID
    private String name;
    private int age;
    private String description;

    // --- Lifestyle & Background (collected during onboarding) ---
    private String occupation;          // e.g. "Software Engineer", "Student", "Athlete"
    private int sleepHours;             // average hours per night (1-12)
    private int exerciseFrequency;      // days per week (0-7)
    private String exerciseType;        // e.g. "Gym", "Running", "Sports", "None"
    private String dietQuality;         // "poor", "average", "good", "excellent"
    private int screenTimeHours;        // daily hours (0-16)
    private String socialLife;          // "isolated", "limited", "moderate", "active", "very_active"
    private String stressSource;        // e.g. "work", "relationships", "finances", "health", "academic"
    private String primaryGoal;         // "reduce_stress", "improve_focus", "boost_creativity", "balance", "fitness", "emotional_health"
    private boolean meditates;
    private boolean readsRegularly;
    private String moodBaseline;        // "anxious", "neutral", "calm", "energetic", "low"
    private int caffeineIntake;         // cups per day (0-10)
    private String relationshipStatus;  // "single", "in_relationship", "married"
    private boolean hasHobbies;
    private String hobbyType;           // "creative", "analytical", "physical", "social", "none"

    // --- Neural metrics (0.0 to 1.0 scale) ---
    private double cognitiveLoad;
    private double stressLevel;
    private double focusIndex;
    private double emotionalBalance;
    private double creativity;
    private double analyticalThinking;
    private double socialEngagement;
    private double physicalActivity;
    private double sleepQuality;
    private double mindfulness;

    // --- Coherence & Scorecard ---
    private double coherenceScore;
    private Map<String, String> scorecard = new HashMap<>(); // metric -> "strength" | "weakness" | "balanced"

    // Brain region activity levels
    private Map<String, Double> brainRegions = new HashMap<>();

    // Neural connections (edges between brain regions)
    private List<NeuralConnection> connections = new ArrayList<>();

    private Instant createdAt;
    private Instant updatedAt;

    public NeuralProfile() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        initDefaultBrainRegions();
    }

    private void initDefaultBrainRegions() {
        brainRegions.put("prefrontalCortex", 0.5);
        brainRegions.put("amygdala", 0.5);
        brainRegions.put("hippocampus", 0.5);
        brainRegions.put("cerebellum", 0.5);
        brainRegions.put("hypothalamus", 0.5);
        brainRegions.put("striatum", 0.5);
        brainRegions.put("parietalLobe", 0.5);
        brainRegions.put("temporalLobe", 0.5);
        brainRegions.put("occipitalLobe", 0.5);
        brainRegions.put("brainstem", 0.7);
        brainRegions.put("thalamusLeft", 0.5);
        brainRegions.put("thalamusRight", 0.5);
    }

    // --- ALL Getters and Setters ---

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }

    public int getSleepHours() { return sleepHours; }
    public void setSleepHours(int sleepHours) { this.sleepHours = sleepHours; }

    public int getExerciseFrequency() { return exerciseFrequency; }
    public void setExerciseFrequency(int exerciseFrequency) { this.exerciseFrequency = exerciseFrequency; }

    public String getExerciseType() { return exerciseType; }
    public void setExerciseType(String exerciseType) { this.exerciseType = exerciseType; }

    public String getDietQuality() { return dietQuality; }
    public void setDietQuality(String dietQuality) { this.dietQuality = dietQuality; }

    public int getScreenTimeHours() { return screenTimeHours; }
    public void setScreenTimeHours(int screenTimeHours) { this.screenTimeHours = screenTimeHours; }

    public String getSocialLife() { return socialLife; }
    public void setSocialLife(String socialLife) { this.socialLife = socialLife; }

    public String getStressSource() { return stressSource; }
    public void setStressSource(String stressSource) { this.stressSource = stressSource; }

    public String getPrimaryGoal() { return primaryGoal; }
    public void setPrimaryGoal(String primaryGoal) { this.primaryGoal = primaryGoal; }

    public boolean isMeditates() { return meditates; }
    public void setMeditates(boolean meditates) { this.meditates = meditates; }

    public boolean isReadsRegularly() { return readsRegularly; }
    public void setReadsRegularly(boolean readsRegularly) { this.readsRegularly = readsRegularly; }

    public String getMoodBaseline() { return moodBaseline; }
    public void setMoodBaseline(String moodBaseline) { this.moodBaseline = moodBaseline; }

    public int getCaffeineIntake() { return caffeineIntake; }
    public void setCaffeineIntake(int caffeineIntake) { this.caffeineIntake = caffeineIntake; }

    public String getRelationshipStatus() { return relationshipStatus; }
    public void setRelationshipStatus(String relationshipStatus) { this.relationshipStatus = relationshipStatus; }

    public boolean isHasHobbies() { return hasHobbies; }
    public void setHasHobbies(boolean hasHobbies) { this.hasHobbies = hasHobbies; }

    public String getHobbyType() { return hobbyType; }
    public void setHobbyType(String hobbyType) { this.hobbyType = hobbyType; }

    public double getCognitiveLoad() { return cognitiveLoad; }
    public void setCognitiveLoad(double cognitiveLoad) { this.cognitiveLoad = cognitiveLoad; }

    public double getStressLevel() { return stressLevel; }
    public void setStressLevel(double stressLevel) { this.stressLevel = stressLevel; }

    public double getFocusIndex() { return focusIndex; }
    public void setFocusIndex(double focusIndex) { this.focusIndex = focusIndex; }

    public double getEmotionalBalance() { return emotionalBalance; }
    public void setEmotionalBalance(double emotionalBalance) { this.emotionalBalance = emotionalBalance; }

    public double getCreativity() { return creativity; }
    public void setCreativity(double creativity) { this.creativity = creativity; }

    public double getAnalyticalThinking() { return analyticalThinking; }
    public void setAnalyticalThinking(double analyticalThinking) { this.analyticalThinking = analyticalThinking; }

    public double getSocialEngagement() { return socialEngagement; }
    public void setSocialEngagement(double socialEngagement) { this.socialEngagement = socialEngagement; }

    public double getPhysicalActivity() { return physicalActivity; }
    public void setPhysicalActivity(double physicalActivity) { this.physicalActivity = physicalActivity; }

    public double getSleepQuality() { return sleepQuality; }
    public void setSleepQuality(double sleepQuality) { this.sleepQuality = sleepQuality; }

    public double getMindfulness() { return mindfulness; }
    public void setMindfulness(double mindfulness) { this.mindfulness = mindfulness; }

    public double getCoherenceScore() { return coherenceScore; }
    public void setCoherenceScore(double coherenceScore) { this.coherenceScore = coherenceScore; }

    public Map<String, String> getScorecard() { return scorecard; }
    public void setScorecard(Map<String, String> scorecard) { this.scorecard = scorecard; }

    public Map<String, Double> getBrainRegions() { return brainRegions; }
    public void setBrainRegions(Map<String, Double> brainRegions) { this.brainRegions = brainRegions; }

    public List<NeuralConnection> getConnections() { return connections; }
    public void setConnections(List<NeuralConnection> connections) { this.connections = connections; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
