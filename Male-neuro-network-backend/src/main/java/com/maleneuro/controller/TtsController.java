package com.maleneuro.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tts")
public class TtsController {

    private static final Logger log = LoggerFactory.getLogger(TtsController.class);

    // Adam voice — professional male, works on free ElevenLabs tier
    private static final String VOICE_ID = "pNInz6obpgDQGcFmaJgB";
    private static final String ELEVENLABS_URL =
            "https://api.elevenlabs.io/v1/text-to-speech/" + VOICE_ID;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String apiKey;

    public TtsController(@Value("${elevenlabs.api.key:}") String apiKey) {
        this.apiKey = apiKey;
    }

    @PostMapping(produces = "audio/mpeg")
    public ResponseEntity<byte[]> synthesize(@RequestBody Map<String, String> req) {
        String text = req.get("text");
        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("ElevenLabs API key not configured");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }

        // Truncate to 500 chars to preserve free quota
        if (text.length() > 500) text = text.substring(0, 497) + "...";

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("xi-api-key", apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(List.of(MediaType.parseMediaType("audio/mpeg")));

            Map<String, Object> body = Map.of(
                    "text", text,
                    "model_id", "eleven_turbo_v2",
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

            HttpHeaders out = new HttpHeaders();
            out.setContentType(MediaType.parseMediaType("audio/mpeg"));
            return ResponseEntity.ok().headers(out).body(response.getBody());

        } catch (Exception e) {
            log.error("ElevenLabs TTS failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
