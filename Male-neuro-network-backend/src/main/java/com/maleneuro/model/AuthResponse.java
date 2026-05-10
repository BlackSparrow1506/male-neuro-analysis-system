package com.maleneuro.model;

public class AuthResponse {
    private String token;
    private String userId;
    private String username;
    private String email;
    private boolean emailVerified;
    private boolean admin;

    public AuthResponse() {}

    public AuthResponse(String token, String userId, String username, String email, boolean emailVerified, boolean admin) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.emailVerified = emailVerified;
        this.admin = admin;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public boolean isAdmin() { return admin; }
    public void setAdmin(boolean admin) { this.admin = admin; }
}
