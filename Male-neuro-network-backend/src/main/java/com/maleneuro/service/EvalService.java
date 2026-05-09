package com.maleneuro.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Deterministic, cheap quality scoring for every AI response. Each check is
 * worth 20 points (max 100). Notes name the checks the response failed so the
 * scoring is transparent — no LLM-as-judge cost or latency.
 */
@Service
public class EvalService {

    private static final int MIN_LEN = 80;
    private static final int MAX_LEN = 4000;

    private static final Pattern SENTENCE_SPLIT = Pattern.compile("(?<=[.!?])\\s+");

    private static final List<Pattern> REFUSAL_PATTERNS = List.of(
            Pattern.compile("(?i)^\\s*i\\s+(can|could)\\s+not\\b"),
            Pattern.compile("(?i)^\\s*i\\s+(can'?t|cannot)\\b"),
            Pattern.compile("(?i)^\\s*i'?m\\s+(sorry|unable)\\b"),
            Pattern.compile("(?i)\\bas\\s+an\\s+ai\\b"),
            Pattern.compile("(?i)\\bi'?m\\s+just\\s+an\\s+ai\\b")
    );

    private static final List<Pattern> ACTIONABLE_PATTERNS = List.of(
            Pattern.compile("(?i)\\b(try|consider|practice|focus|aim|start|build|track|reduce|increase|set|schedule)\\b")
    );

    private static final Set<String> STOPWORDS = new HashSet<>(Arrays.asList(
            "the","a","an","and","or","but","is","are","was","were","be","been","being",
            "i","you","we","they","he","she","it","me","my","your","our","their",
            "to","of","in","on","at","for","with","by","from","as","that","this","these","those",
            "what","why","how","when","where","who","do","does","did","have","has","had",
            "can","could","should","would","will","may","might","just","not","no","yes",
            "about","into","over","under","than","then","so","if","there","here"
    ));

    public Result evaluate(String prompt, String response) {
        List<String> notes = new ArrayList<>();
        int score = 100;

        if (response == null || response.isBlank()) {
            return new Result(0, List.of("empty_response"));
        }

        if (response.length() < MIN_LEN) {
            score -= 20;
            notes.add("too_short");
        } else if (response.length() > MAX_LEN) {
            score -= 20;
            notes.add("too_long");
        }

        for (Pattern p : REFUSAL_PATTERNS) {
            if (p.matcher(response).find()) {
                score -= 20;
                notes.add("refusal_detected");
                break;
            }
        }

        if (hasRepeatedSentence(response)) {
            score -= 20;
            notes.add("repetition_detected");
        }

        if (!sharesSignificantTerm(prompt, response)) {
            score -= 20;
            notes.add("low_personalization");
        }

        boolean actionable = false;
        for (Pattern p : ACTIONABLE_PATTERNS) {
            if (p.matcher(response).find()) { actionable = true; break; }
        }
        if (!actionable) {
            score -= 20;
            notes.add("no_actionable_advice");
        }

        return new Result(Math.max(0, score), notes);
    }

    private boolean hasRepeatedSentence(String response) {
        String[] sentences = SENTENCE_SPLIT.split(response.trim());
        Set<String> seen = new HashSet<>();
        for (String s : sentences) {
            String norm = s.toLowerCase(Locale.ROOT).replaceAll("\\s+", " ").trim();
            if (norm.length() >= 25 && !seen.add(norm)) {
                return true;
            }
        }
        return false;
    }

    private boolean sharesSignificantTerm(String prompt, String response) {
        if (prompt == null || prompt.isBlank()) return true;
        Set<String> promptTerms = significantTerms(prompt);
        if (promptTerms.isEmpty()) return true;
        Set<String> responseTerms = significantTerms(response);
        for (String t : promptTerms) {
            if (responseTerms.contains(t)) return true;
        }
        return false;
    }

    private Set<String> significantTerms(String text) {
        Set<String> out = new HashSet<>();
        for (String w : text.toLowerCase(Locale.ROOT).split("[^a-z0-9']+")) {
            if (w.length() >= 4 && !STOPWORDS.contains(w)) {
                out.add(w);
            }
        }
        return out;
    }

    public record Result(int score, List<String> notes) {}
}
