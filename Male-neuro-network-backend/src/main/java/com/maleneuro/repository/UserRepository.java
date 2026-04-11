package com.maleneuro.repository;

import com.maleneuro.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByVerificationToken(String verificationToken);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
