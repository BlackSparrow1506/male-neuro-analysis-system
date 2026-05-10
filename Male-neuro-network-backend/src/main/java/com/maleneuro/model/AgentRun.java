package com.maleneuro.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * A single end-to-end orchestration run: Router → Responder → Validator → optional Recovery.
 * Persisted so any reply can be replayed step-by-step in the UI for audit and debugging.
 */
@Document(collection = "agent_runs")
public class AgentRun {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String profileId;

    private String message;
    private String response;
    private String intent;

    private long totalLatencyMs;
    private Integer finalScore;

    private List<Step> steps = new ArrayList<>();

    private Instant createdAt = Instant.now();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getProfileId() { return profileId; }
    public void setProfileId(String profileId) { this.profileId = profileId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }

    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }

    public long getTotalLatencyMs() { return totalLatencyMs; }
    public void setTotalLatencyMs(long totalLatencyMs) { this.totalLatencyMs = totalLatencyMs; }

    public Integer getFinalScore() { return finalScore; }
    public void setFinalScore(Integer finalScore) { this.finalScore = finalScore; }

    public List<Step> getSteps() { return steps; }
    public void setSteps(List<Step> steps) { this.steps = steps; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static class Step {
        private String name;
        private String status;
        private long latencyMs;
        private String inputPreview;
        private String outputPreview;
        private String notes;
        private Instant startedAt;

        public Step() {}

        public Step(String name, String inputPreview) {
            this.name = name;
            this.inputPreview = inputPreview;
            this.startedAt = Instant.now();
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public long getLatencyMs() { return latencyMs; }
        public void setLatencyMs(long latencyMs) { this.latencyMs = latencyMs; }

        public String getInputPreview() { return inputPreview; }
        public void setInputPreview(String inputPreview) { this.inputPreview = inputPreview; }

        public String getOutputPreview() { return outputPreview; }
        public void setOutputPreview(String outputPreview) { this.outputPreview = outputPreview; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }

        public Instant getStartedAt() { return startedAt; }
        public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    }
}
