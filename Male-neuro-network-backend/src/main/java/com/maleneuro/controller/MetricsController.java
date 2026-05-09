package com.maleneuro.controller;

import com.maleneuro.service.MetricsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/metrics")
public class MetricsController {

    private static final long MAX_WINDOW_SECONDS = Duration.ofDays(1).toSeconds();
    private static final long DEFAULT_WINDOW_SECONDS = Duration.ofHours(1).toSeconds();

    private final MetricsService metricsService;

    public MetricsController(MetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @GetMapping
    public ResponseEntity<MetricsService.Snapshot> snapshot(
            @RequestParam(name = "windowSeconds", required = false) Long windowSeconds) {
        long seconds = windowSeconds == null ? DEFAULT_WINDOW_SECONDS : windowSeconds;
        seconds = Math.max(60, Math.min(MAX_WINDOW_SECONDS, seconds));
        return ResponseEntity.ok(metricsService.snapshot(Duration.ofSeconds(seconds)));
    }
}
