package com.maleneuro.service.llm;

import java.util.List;

/**
 * Provider-agnostic chat-completion port (DIP). High-level services
 * (chat-response builder, Gita guidance) depend on this interface; the
 * Resilience4j retry + circuit-breaker policy lives on the concrete
 * implementation, not the caller.
 *
 * Today there is one implementation, {@link GroqLlmClient}. Swapping in
 * another provider (OpenAI, Anthropic, a local LLM) is a matter of writing
 * a new implementation and toggling which {@code @Component} is registered;
 * no caller has to change.
 */
public interface LlmClient {

    /** Chat-style completion. Throws RuntimeException on any upstream failure. */
    String chatComplete(LlmRequest request);

    record LlmRequest(List<LlmMessage> messages, double temperature, int maxTokens) {

        public static LlmRequest singleUser(String prompt, double temperature, int maxTokens) {
            return new LlmRequest(List.of(LlmMessage.user(prompt)), temperature, maxTokens);
        }
    }

    record LlmMessage(String role, String content) {

        public static LlmMessage system(String content) { return new LlmMessage("system", content); }
        public static LlmMessage user(String content)   { return new LlmMessage("user", content); }
    }
}
