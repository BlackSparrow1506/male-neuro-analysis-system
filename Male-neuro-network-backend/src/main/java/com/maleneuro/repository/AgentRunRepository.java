package com.maleneuro.repository;

import com.maleneuro.model.AgentRun;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AgentRunRepository extends MongoRepository<AgentRun, String> {
}
