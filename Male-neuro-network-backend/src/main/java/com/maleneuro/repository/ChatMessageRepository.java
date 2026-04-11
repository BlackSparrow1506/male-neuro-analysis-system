package com.maleneuro.repository;

import com.maleneuro.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findByProfileIdOrderByTimestampAsc(String profileId);
    List<ChatMessage> findTop50ByProfileIdOrderByTimestampDesc(String profileId);
    void deleteByProfileId(String profileId);
}
