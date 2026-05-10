package com.maleneuro.service;

import com.maleneuro.model.User;
import com.maleneuro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Single source of truth for "is this caller an admin?". Controllers call
 * {@link #assertAdmin(String)} at the top of every governance endpoint;
 * other services use {@link #syncAdminFlag(User)} to auto-promote on
 * login / registration based on the admin-emails config.
 */
@Service
public class AdminGuard {

    private final UserRepository userRepo;
    private final Set<String> adminEmails;

    public AdminGuard(UserRepository userRepo,
                      @Value("${app.admin.emails:}") String adminEmailsCsv) {
        this.userRepo = userRepo;
        this.adminEmails = adminEmailsCsv == null || adminEmailsCsv.isBlank()
                ? Set.of()
                : Arrays.stream(adminEmailsCsv.split(","))
                        .map(s -> s.trim().toLowerCase(Locale.ROOT))
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toUnmodifiableSet());
    }

    public boolean isAdmin(String userId) {
        return userRepo.findById(userId).map(User::isAdmin).orElse(false);
    }

    public void assertAdmin(String userId) {
        if (!isAdmin(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
        }
    }

    /** Promote (or demote) the user based on the configured admin-email allowlist. */
    public boolean syncAdminFlag(User user) {
        if (user == null || user.getEmail() == null) return false;
        boolean shouldBeAdmin = adminEmails.contains(user.getEmail().toLowerCase(Locale.ROOT));
        if (shouldBeAdmin != user.isAdmin()) {
            user.setAdmin(shouldBeAdmin);
            return true;
        }
        return false;
    }
}
