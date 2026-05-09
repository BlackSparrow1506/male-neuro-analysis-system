package com.maleneuro.service;

import com.maleneuro.model.AuditLog;
import com.maleneuro.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);
    private static final int PREVIEW_MAX_CHARS = 240;

    private final AuditLogRepository repo;

    public AuditLogService(AuditLogRepository repo) {
        this.repo = repo;
    }

    public void record(AuditLog entry) {
        try {
            entry.setRequestPreview(truncate(entry.getRequestPreview()));
            entry.setResponsePreview(truncate(entry.getResponsePreview()));
            entry.setErrorMessage(truncate(entry.getErrorMessage()));
            repo.save(entry);
        } catch (Exception e) {
            log.warn("Failed to persist audit log for user {} action {}: {}",
                    entry.getUserId(), entry.getAction(), e.getMessage());
        }
    }

    public List<AuditLog> getForUser(String userId, int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 200));
        return repo.findByUserIdOrderByTimestampDesc(userId, PageRequest.of(0, safeLimit));
    }

    public void deleteForUser(String userId) {
        repo.deleteByUserId(userId);
    }

    private String truncate(String value) {
        if (value == null) return null;
        if (value.length() <= PREVIEW_MAX_CHARS) return value;
        return value.substring(0, PREVIEW_MAX_CHARS - 3) + "...";
    }
}
