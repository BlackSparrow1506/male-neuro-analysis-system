package com.maleneuro.controller;

import com.maleneuro.config.JwtUtil;
import com.maleneuro.model.AuthProvider;
import com.maleneuro.model.AuthRequest;
import com.maleneuro.model.AuthResponse;
import com.maleneuro.model.NeuralProfile;
import com.maleneuro.model.User;
import com.maleneuro.repository.ChatMessageRepository;
import com.maleneuro.repository.NeuralProfileRepository;
import com.maleneuro.repository.UserRepository;
import com.maleneuro.service.AuditLogService;
import com.maleneuro.service.GoogleAuthService;
import com.maleneuro.service.MailService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private static final Pattern EMAIL_RE    = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final Pattern USERNAME_RE = Pattern.compile("^[A-Za-z0-9_.-]{3,30}$");

    private final UserRepository userRepo;
    private final NeuralProfileRepository profileRepo;
    private final ChatMessageRepository chatRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final MailService mailService;
    private final GoogleAuthService googleAuthService;
    private final AuditLogService auditLogService;
    private final String frontendUrl;

    public AuthController(UserRepository userRepo,
                          NeuralProfileRepository profileRepo,
                          ChatMessageRepository chatRepo,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          MailService mailService,
                          GoogleAuthService googleAuthService,
                          AuditLogService auditLogService,
                          @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) {
        this.userRepo = userRepo;
        this.profileRepo = profileRepo;
        this.chatRepo = chatRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.mailService = mailService;
        this.googleAuthService = googleAuthService;
        this.auditLogService = auditLogService;
        this.frontendUrl = frontendUrl;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest req) {
        String username = req.getUsername() == null ? "" : req.getUsername().trim();
        String email    = req.getEmail() == null ? "" : req.getEmail().trim().toLowerCase();
        String password = req.getPassword();

        if (!USERNAME_RE.matcher(username).matches() && !EMAIL_RE.matcher(username).matches()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Username must be 3–30 characters (letters, numbers, _ . -) or a valid email address"));
        }
        if (!EMAIL_RE.matcher(email).matches()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Enter a valid email address"));
        }
        if (password == null || password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters"));
        }
        if (userRepo.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken"));
        }
        if (userRepo.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already registered"));
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setEmailVerified(false);
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setVerificationTokenExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
        user = userRepo.save(user);

        try {
            mailService.sendVerificationEmail(user.getEmail(), user.getUsername(), user.getVerificationToken());
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", user.getEmail(), e.getMessage());
        }

        return ResponseEntity.ok(Map.of(
                "message", "Account created. Check your inbox to verify your email.",
                "username", user.getUsername(),
                "email", user.getEmail(),
                "emailVerified", false
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        String identifier = req.getUsername() != null && !req.getUsername().isBlank()
                ? req.getUsername().trim()
                : (req.getEmail() == null ? "" : req.getEmail().trim());
        String password = req.getPassword();

        if (identifier.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username and password are required"));
        }

        Optional<User> found = identifier.contains("@")
                ? userRepo.findByEmail(identifier.toLowerCase())
                : userRepo.findByUsername(identifier);

        return found
                .filter(u -> passwordEncoder.matches(password, u.getPasswordHash()))
                .map(u -> {
                    if (!u.isEmailVerified()) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body((Object) Map.of(
                                "message", "Please verify your email before signing in.",
                                "emailVerified", false,
                                "email", u.getEmail()
                        ));
                    }
                    String token = jwtUtil.generateToken(u.getId());
                    return ResponseEntity.ok((Object) new AuthResponse(
                            token, u.getId(), u.getUsername(), u.getEmail(), true));
                })
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid username or password")));
    }

    @PostMapping("/google")
    public ResponseEntity<?> google(@RequestBody Map<String, String> req) {
        String idToken = req.get("idToken");
        GoogleIdToken.Payload payload = googleAuthService.verify(idToken);

        String email = payload.getEmail().toLowerCase();
        String name  = (String) payload.get("name");

        Optional<User> existing = userRepo.findByEmail(email);
        boolean isNew = existing.isEmpty();
        User user;
        if (isNew) {
            user = new User();
            user.setEmail(email);
            user.setUsername(generateUsernameFromEmail(email, name));
            user.setEmailVerified(true);
            user.setAuthProvider(AuthProvider.GOOGLE.name());
            user = userRepo.save(user);
        } else {
            user = existing.get();
            if (!user.isEmailVerified()) {
                user.setEmailVerified(true);
                user = userRepo.save(user);
            }
        }

        if (isNew) {
            try {
                mailService.sendWelcomeEmail(user.getEmail(), user.getUsername());
            } catch (Exception e) {
                log.error("Failed to send welcome email to {}: {}", user.getEmail(), e.getMessage());
            }
        }

        String token = jwtUtil.generateToken(user.getId());
        return ResponseEntity.ok(new AuthResponse(
                token, user.getId(), user.getUsername(), user.getEmail(), true));
    }

    private String generateUsernameFromEmail(String email, String displayName) {
        String base = email.substring(0, email.indexOf('@'))
                .replaceAll("[^A-Za-z0-9_.-]", "")
                .toLowerCase();
        if (base.length() < 3) {
            base = "user" + base;
        }
        if (base.length() > 25) {
            base = base.substring(0, 25);
        }
        String candidate = base;
        int suffix = 0;
        while (userRepo.existsByUsername(candidate)) {
            suffix++;
            candidate = base + suffix;
        }
        return candidate;
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam("token") String token) {
        Optional<User> found = userRepo.findByVerificationToken(token);
        if (found.isEmpty()) {
            return redirectToFrontend("error", "invalid");
        }
        User user = found.get();
        if (user.isEmailVerified()) {
            return redirectToFrontend("ok", "already");
        }
        if (user.getVerificationTokenExpiresAt() == null
                || user.getVerificationTokenExpiresAt().isBefore(Instant.now())) {
            return redirectToFrontend("error", "expired");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiresAt(null);
        userRepo.save(user);

        try {
            mailService.sendWelcomeEmail(user.getEmail(), user.getUsername());
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", user.getEmail(), e.getMessage());
        }

        return redirectToFrontend("ok", "verified");
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody AuthRequest req) {
        String email = req.getEmail() == null ? "" : req.getEmail().trim().toLowerCase();
        if (!EMAIL_RE.matcher(email).matches()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Enter a valid email address"));
        }

        Optional<User> found = userRepo.findByEmail(email);
        // Always respond OK to avoid leaking which emails are registered.
        if (found.isPresent() && !found.get().isEmailVerified()) {
            User user = found.get();
            user.setVerificationToken(UUID.randomUUID().toString());
            user.setVerificationTokenExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
            userRepo.save(user);
            try {
                mailService.sendVerificationEmail(user.getEmail(), user.getUsername(), user.getVerificationToken());
            } catch (Exception e) {
                log.error("Failed to resend verification email to {}: {}", user.getEmail(), e.getMessage());
            }
        }
        return ResponseEntity.ok(Map.of("message", "If that email exists, a verification link has been sent."));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal String userId) {
        return userRepo.findById(userId)
                .map(u -> ResponseEntity.ok((Object) Map.of(
                        "userId", u.getId(),
                        "username", u.getUsername(),
                        "email", u.getEmail(),
                        "emailVerified", u.isEmailVerified(),
                        "createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : ""
                )))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found")));
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal String userId,
                                            @RequestBody Map<String, String> req) {
        String currentPassword = req.get("currentPassword");
        String newPassword = req.get("newPassword");

        if (currentPassword == null || currentPassword.isBlank() ||
            newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password must be at least 6 characters"));
        }

        return userRepo.findById(userId)
                .map(u -> {
                    if (!passwordEncoder.matches(currentPassword, u.getPasswordHash())) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body((Object) Map.of("message", "Current password is incorrect"));
                    }
                    u.setPasswordHash(passwordEncoder.encode(newPassword));
                    userRepo.save(u);
                    return ResponseEntity.ok((Object) Map.of("message", "Password updated successfully"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found")));
    }

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(@AuthenticationPrincipal String userId) {
        if (!userRepo.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }
        // Delete all chat messages for each profile, then delete profiles, audit logs, then delete user
        List<NeuralProfile> profiles = profileRepo.findByUserId(userId);
        for (NeuralProfile profile : profiles) {
            chatRepo.deleteByProfileId(profile.getId());
        }
        profileRepo.deleteAll(profiles);
        auditLogService.deleteForUser(userId);
        userRepo.deleteById(userId);
        log.info("Account deleted for userId={}", userId);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }

    private ResponseEntity<Void> redirectToFrontend(String status, String reason) {
        String url = frontendUrl + "/?verify=" + status + "&reason=" + reason;
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(url))
                .build();
    }
}
