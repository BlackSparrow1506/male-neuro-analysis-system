package com.maleneuro.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "audit_logs")
public class AuditLog {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String profileId;

    private String action;

    private String requestPreview;
    private String responsePreview;

    private long latencyMs;
    private boolean success;
    private String errorMessage;

    private String model;

    private Integer evalScore;
    private List<String> evalNotes;

    @Indexed
    private Instant timestamp;

    public AuditLog() {
        this.timestamp = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getProfileId() { return profileId; }
    public void setProfileId(String profileId) { this.profileId = profileId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getRequestPreview() { return requestPreview; }
    public void setRequestPreview(String requestPreview) { this.requestPreview = requestPreview; }

    public String getResponsePreview() { return responsePreview; }
    public void setResponsePreview(String responsePreview) { this.responsePreview = responsePreview; }

    public long getLatencyMs() { return latencyMs; }
    public void setLatencyMs(long latencyMs) { this.latencyMs = latencyMs; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getEvalScore() { return evalScore; }
    public void setEvalScore(Integer evalScore) { this.evalScore = evalScore; }

    public List<String> getEvalNotes() { return evalNotes; }
    public void setEvalNotes(List<String> evalNotes) { this.evalNotes = evalNotes; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
