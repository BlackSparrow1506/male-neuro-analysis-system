package com.maleneuro.service.llm;

import com.maleneuro.config.ExternalApis;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Groq-backed implementation of {@link LlmClient}. Owns the HTTP call, the
 * Resilience4j retry / circuit-breaker policy, and Groq-specific request and
 * response parsing. No domain logic — the caller decides what messages to
 * send and how to handle failure (e.g. ChatResponseService produces a
 * profile-aware fallback when this throws).
 */
@Component
public class GroqLlmClient implements LlmClient {

    public static final String CB_NAME = "groq";

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String model;

    public GroqLlmClient(RestTemplate restTemplate,
                         @Value("${groq.api.key}") String apiKey,
                         @Value("${groq.model:" + ExternalApis.Groq.DEFAULT_MODEL + "}") String model) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
        this.model = model;
    }

    @Override
    @Retry(name = CB_NAME)
    @CircuitBreaker(name = CB_NAME)
    public String chatComplete(LlmRequest request) {
        List<Map<String, Object>> wireMessages = new ArrayList<>();
        for (LlmMessage m : request.messages()) {
            wireMessages.add(Map.of("role", m.role(), "content", m.content()));
        }

        Map<String, Object> requestBody = Map.of(
                "model",       model,
                "messages",    wireMessages,
                "temperature", request.temperature(),
                "max_tokens",  request.maxTokens()
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                ExternalApis.Groq.CHAT_COMPLETIONS_URL,
                HttpMethod.POST,
                new HttpEntity<>(requestBody, headers),
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        return extractText(response.getBody());
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> responseBody) {
        if (responseBody == null) {
            throw new IllegalStateException("Empty response body from Groq API");
        }
        try {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse Groq response: " + responseBody, e);
        }
    }
}
