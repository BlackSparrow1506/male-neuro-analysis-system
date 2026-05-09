package com.maleneuro.repository;

import com.maleneuro.model.AuditLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AuditLogRepository extends MongoRepository<AuditLog, String> {
    List<AuditLog> findByUserIdOrderByTimestampDesc(String userId, Pageable pageable);
    void deleteByUserId(String userId);
}
