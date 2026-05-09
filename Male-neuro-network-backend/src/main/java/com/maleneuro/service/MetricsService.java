package com.maleneuro.service;

import com.maleneuro.model.AuditLog;
import com.maleneuro.repository.AuditLogRepository;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Computes a live SLA snapshot from the audit log and the Resilience4j
 * registry. Latency percentiles, request counts, success rate, and
 * upstream circuit-breaker state are all derived from data we already
 * collect — no new persistence required.
 */
@Service
public class MetricsService {

    private final AuditLogRepository auditRepo;
    private final CircuitBreakerRegistry breakerRegistry;

    public MetricsService(AuditLogRepository auditRepo, CircuitBreakerRegistry breakerRegistry) {
        this.auditRepo = auditRepo;
        this.breakerRegistry = breakerRegistry;
    }

    public Snapshot snapshot(Duration lookback) {
        Instant since = Instant.now().minus(lookback);
        List<AuditLog> recent = auditRepo.findByTimestampGreaterThanEqual(since);

        Map<String, List<AuditLog>> byAction = new LinkedHashMap<>();
        for (AuditLog log : recent) {
            String action = log.getAction() == null ? "unknown" : log.getAction();
            byAction.computeIfAbsent(action, k -> new ArrayList<>()).add(log);
        }

        List<ActionStats> actions = new ArrayList<>();
        for (Map.Entry<String, List<AuditLog>> entry : byAction.entrySet()) {
            actions.add(computeActionStats(entry.getKey(), entry.getValue(), lookback));
        }
        actions.sort((a, b) -> Long.compare(b.count(), a.count()));

        List<BreakerStats> breakers = new ArrayList<>();
        for (CircuitBreaker cb : breakerRegistry.getAllCircuitBreakers()) {
            CircuitBreaker.Metrics m = cb.getMetrics();
            breakers.add(new BreakerStats(
                    cb.getName(),
                    cb.getState().name(),
                    m.getNumberOfBufferedCalls(),
                    m.getNumberOfFailedCalls(),
                    round1(m.getFailureRate()),
                    round1(m.getSlowCallRate())
            ));
        }
        breakers.sort((a, b) -> a.name().compareTo(b.name()));

        return new Snapshot(since, Instant.now(), lookback.toSeconds(), actions, breakers);
    }

    private ActionStats computeActionStats(String action, List<AuditLog> entries, Duration lookback) {
        long count = entries.size();
        long successes = entries.stream().filter(AuditLog::isSuccess).count();
        long failures = count - successes;
        double successRatePct = count == 0 ? 100.0 : 100.0 * successes / count;
        double perMinute = lookback.toSeconds() == 0 ? 0 : (count * 60.0) / lookback.toSeconds();

        List<Long> latencies = new ArrayList<>();
        for (AuditLog log : entries) {
            if (log.getLatencyMs() > 0) {
                latencies.add(log.getLatencyMs());
            }
        }
        Collections.sort(latencies);

        return new ActionStats(
                action,
                count,
                successes,
                failures,
                round1(successRatePct),
                round1(perMinute),
                percentile(latencies, 50),
                percentile(latencies, 95),
                percentile(latencies, 99)
        );
    }

    private static long percentile(List<Long> sorted, int pct) {
        if (sorted.isEmpty()) return 0;
        int idx = (int) Math.ceil(sorted.size() * (pct / 100.0)) - 1;
        idx = Math.max(0, Math.min(sorted.size() - 1, idx));
        return sorted.get(idx);
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    public record Snapshot(
            Instant since,
            Instant until,
            long windowSeconds,
            List<ActionStats> actions,
            List<BreakerStats> breakers) {}

    public record ActionStats(
            String action,
            long count,
            long successCount,
            long failureCount,
            double successRatePct,
            double perMinute,
            long latencyP50Ms,
            long latencyP95Ms,
            long latencyP99Ms) {}

    public record BreakerStats(
            String name,
            String state,
            int bufferedCalls,
            int failedCalls,
            double failureRatePct,
            double slowCallRatePct) {}
}
