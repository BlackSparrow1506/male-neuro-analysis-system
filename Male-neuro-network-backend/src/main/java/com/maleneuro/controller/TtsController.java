package com.maleneuro.controller;

import com.maleneuro.config.ExternalApis;
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

    private static final String ELEVENLABS_URL =
            ExternalApis.ElevenLabs.ttsUrl(ExternalApis.ElevenLabs.DEFAULT_VOICE_ID);

    private final RestTemplate restTemplate = new RestTemplate();
    private final String apiKey;

    public TtsController(@Value("${elevenlabs.api.key:}") String apiKey) {
        this.apiKey = apiKey;
    }

    @PostMapping(produces = ExternalApis.ElevenLabs.AUDIO_MIME)
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

            HttpHeaders out = new HttpHeaders();
            out.setContentType(MediaType.parseMediaType(ExternalApis.ElevenLabs.AUDIO_MIME));
            return ResponseEntity.ok().headers(out).body(response.getBody());

        } catch (Exception e) {
            log.error("ElevenLabs TTS failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
