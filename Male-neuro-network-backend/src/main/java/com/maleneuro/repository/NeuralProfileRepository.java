package com.maleneuro.repository;

import com.maleneuro.model.NeuralProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NeuralProfileRepository extends MongoRepository<NeuralProfile, String> {
    List<NeuralProfile> findByUserId(String userId);
}
