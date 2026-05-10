package com.maleneuro.repository;

import com.maleneuro.model.AgentRun;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AgentRunRepository extends MongoRepository<AgentRun, String> {
    List<AgentRun> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
