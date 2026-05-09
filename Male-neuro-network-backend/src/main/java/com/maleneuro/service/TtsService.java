package com.maleneuro.service;

import com.maleneuro.config.ExternalApis;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class TtsService {

    public static final String CB_NAME = "elevenlabs";

    private static final String ELEVENLABS_URL =
            ExternalApis.ElevenLabs.ttsUrl(ExternalApis.ElevenLabs.DEFAULT_VOICE_ID);

    private final RestTemplate restTemplate = new RestTemplate();
    private final String apiKey;

    public TtsService(@Value("${elevenlabs.api.key:}") String apiKey) {
        this.apiKey = apiKey;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    @Retry(name = CB_NAME)
    @CircuitBreaker(name = CB_NAME)
    public byte[] synthesize(String text) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("xi-api-key", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.parseMediaType(ExternalApis.ElevenLabs.AUDIO_MIME)));

        Map<String, Object> body = Map.of(
                "text", text,
                "model_id", ExternalApis.ElevenLabs.DEFAULT_MODEL,
                "voice_settings", Map.of(
                        "stability", 0.45,
                        "similarity_boost", 0.80,
                        "style", 0.15,
                        "use_speaker_boost", true
                )
        );

        ResponseEntity<byte[]> response = restTemplate.exchange(
                ELEVENLABS_URL,
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                byte[].class
        );

        return response.getBody();
    }
}
