package com.maleneuro.service;

import com.maleneuro.model.AgentRun;
import com.maleneuro.model.AuditLog;
import com.maleneuro.model.ChatMessage;
import com.maleneuro.model.ChatRole;
import com.maleneuro.model.NeuralProfile;
import com.maleneuro.repository.AgentRunRepository;
import com.maleneuro.repository.ChatMessageRepository;
import com.maleneuro.repository.NeuralProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Orchestrates the chat-analysis flow: persist the user message, update the
 * profile's metrics from the message text, run the multi-agent orchestrator,
 * persist the assistant reply and the {@link AgentRun} trace, and emit an
 * audit entry covering the whole call.
 *
 * SRP: this service does not own profile CRUD (see {@link ProfileService}) or
 * the metric math (see {@link ProfileMetricsCalculator}). It only coordinates
 * the chat pipeline and side effects around it.
 */
@Service
public class ChatAnalysisService {

    private static final String MODEL_LABEL = "groq";
    private static final String ACTION_CHAT_MESSAGE = "chat.message";

    private final NeuralProfileRepository profileRepo;
    private final ChatMessageRepository chatRepo;
    private final AgentRunRepository agentRunRepo;
    private final AgentOrchestratorService orchestrator;
    private final AuditLogService auditLogService;
    private final ProfileMetricsCalculator metrics;
    private final MessageMetricsUpdater messageUpdater;

    public ChatAnalysisService(NeuralProfileRepository profileRepo,
                                ChatMessageRepository chatRepo,
                                AgentRunRepository agentRunRepo,
                                AgentOrchestratorService orchestrator,
                                AuditLogService auditLogService,
                                ProfileMetricsCalculator metrics,
                                MessageMetricsUpdater messageUpdater) {
        this.profileRepo = profileRepo;
        this.chatRepo = chatRepo;
        this.agentRunRepo = agentRunRepo;
        this.orchestrator = orchestrator;
        this.auditLogService = auditLogService;
        this.metrics = metrics;
        this.messageUpdater = messageUpdater;
    }

    public ChatMessage analyzeMessage(String profileId, String userMessage) {
        NeuralProfile profile = profileRepo.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found: " + profileId));

        // Snapshot prior history before persisting the new message so we don't
        // double-count the latest user turn in the LLM context window.
        List<ChatMessage> priorHistory = chatRepo
                .findTop50ByProfileIdOrderByTimestampDesc(profileId)
                .stream()
                .sorted(Comparator.comparing(ChatMessage::getTimestamp))
                .collect(Collectors.toList());

        chatRepo.save(new ChatMessage(profileId, ChatRole.USER.wire(), userMessage));

        messageUpdater.apply(profile, userMessage);
        metrics.recomputeFromMessage(profile);
        profile.setUpdatedAt(Instant.now());
        profileRepo.save(profile);

        AgentRun run = null;
        boolean success = false;
        String errorMessage = null;
        long started = System.currentTimeMillis();
        try {
            run = orchestrator.run(profile, priorHistory, userMessage);
            run = agentRunRepo.save(run);
            success = true;

            ChatMessage aiMessage = new ChatMessage(profileId, ChatRole.ASSISTANT.wire(), run.getResponse());
            aiMessage.setAgentRunId(run.getId());
            return chatRepo.save(aiMessage);
        } catch (RuntimeException ex) {
            errorMessage = ex.getMessage();
            throw ex;
        } finally {
            recordAudit(profile, profileId, userMessage, run, success, errorMessage,
                    System.currentTimeMillis() - started);
        }
    }

    public Optional<AgentRun> getAgentRun(String id) {
        return agentRunRepo.findById(id);
    }

    public List<ChatMessage> getChatHistory(String profileId) {
        return chatRepo.findByProfileIdOrderByTimestampAsc(profileId);
    }

    private void recordAudit(NeuralProfile profile, String profileId, String userMessage,
                              AgentRun run, boolean success, String errorMessage, long latencyMs) {
        AuditLog entry = new AuditLog();
        entry.setUserId(profile.getUserId());
        entry.setProfileId(profileId);
        entry.setAction(ACTION_CHAT_MESSAGE);
        entry.setRequestPreview(userMessage);
        entry.setLatencyMs(latencyMs);
        entry.setSuccess(success);
        entry.setModel(MODEL_LABEL);
        if (run != null) {
            entry.setResponsePreview(run.getResponse());
            entry.setEvalScore(run.getFinalScore());
        }
        if (errorMessage != null) {
            entry.setErrorMessage(errorMessage);
        }
        auditLogService.record(entry);
    }
}
