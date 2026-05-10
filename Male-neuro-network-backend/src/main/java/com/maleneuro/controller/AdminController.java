package com.maleneuro.controller;

import com.maleneuro.model.AgentRun;
import com.maleneuro.model.AuditLog;
import com.maleneuro.repository.AgentRunRepository;
import com.maleneuro.repository.AuditLogRepository;
import com.maleneuro.repository.NeuralProfileRepository;
import com.maleneuro.repository.UserRepository;
import com.maleneuro.service.AdminGuard;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/** All endpoints under /api/admin require the caller to be an admin. */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final int DEFAULT_LIMIT = 100;
    private static final int MAX_LIMIT = 500;

    private final AdminGuard adminGuard;
    private final AuditLogRepository auditRepo;
    private final AgentRunRepository agentRunRepo;
    private final UserRepository userRepo;
    private final NeuralProfileRepository profileRepo;

    public AdminController(AdminGuard adminGuard,
                           AuditLogRepository auditRepo,
                           AgentRunRepository agentRunRepo,
                           UserRepository userRepo,
                           NeuralProfileRepository profileRepo) {
        this.adminGuard = adminGuard;
        this.auditRepo = auditRepo;
        this.agentRunRepo = agentRunRepo;
        this.userRepo = userRepo;
        this.profileRepo = profileRepo;
    }

    @GetMapping("/audit")
    public ResponseEntity<List<AuditLog>> recentAudit(
            @AuthenticationPrincipal String userId,
            @RequestParam(name = "limit", required = false) Integer limit) {
        adminGuard.assertAdmin(userId);
        return ResponseEntity.ok(auditRepo.findAllByOrderByTimestampDesc(PageRequest.of(0, clamp(limit))));
    }

    @GetMapping("/agent-runs")
    public ResponseEntity<List<AgentRun>> recentAgentRuns(
            @AuthenticationPrincipal String userId,
            @RequestParam(name = "limit", required = false) Integer limit) {
        adminGuard.assertAdmin(userId);
        return ResponseEntity.ok(agentRunRepo.findAllByOrderByCreatedAtDesc(PageRequest.of(0, clamp(limit))));
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> overview(@AuthenticationPrincipal String userId) {
        adminGuard.assertAdmin(userId);
        return ResponseEntity.ok(Map.of(
                "totalUsers",     userRepo.count(),
                "totalProfiles",  profileRepo.count(),
                "totalAuditLogs", auditRepo.count(),
                "totalAgentRuns", agentRunRepo.count()
        ));
    }

    private int clamp(Integer limit) {
        if (limit == null || limit <= 0) return DEFAULT_LIMIT;
        return Math.min(limit, MAX_LIMIT);
    }
}
