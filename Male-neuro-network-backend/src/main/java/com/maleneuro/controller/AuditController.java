package com.maleneuro.controller;

import com.maleneuro.model.AuditLog;
import com.maleneuro.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditLogService auditLogService;

    public AuditController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping("/me")
    public ResponseEntity<List<AuditLog>> getMyAuditLog(
            @AuthenticationPrincipal String userId,
            @RequestParam(name = "limit", defaultValue = "50") int limit) {
        return ResponseEntity.ok(auditLogService.getForUser(userId, limit));
    }
}
