package com.maleneuro.model;

public enum ChatRole {
    SYSTEM("system"),
    USER("user"),
    ASSISTANT("assistant");

    private final String wire;

    ChatRole(String wire) {
        this.wire = wire;
    }

    public String wire() {
        return wire;
    }
}
