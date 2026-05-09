package com.maleneuro.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Hard limits that protect the AI pipeline from abuse and prevent the model
 * from emitting PII back to the user. Input checks reject the request before
 * it reaches the model; output filters redact specific patterns from the
 * model's reply before it is persisted or shown.
 */
@Service
public class GuardrailService {

    public static final int MAX_INPUT_CHARS = 4000;

    public static final String CATEGORY_OK             = "OK";
    public static final String CATEGORY_EMPTY          = "EMPTY";
    public static final String CATEGORY_TOO_LONG       = "TOO_LONG";
    public static final String CATEGORY_INJECTION      = "PROMPT_INJECTION";
    public static final String CATEGORY_DISALLOWED     = "DISALLOWED_TOPIC";

    private static final List<Pattern> INJECTION_PATTERNS = List.of(
            Pattern.compile("(?i)ignore\\s+(all\\s+)?(previous|prior|above)\\s+(instructions|prompts?|rules?)"),
            Pattern.compile("(?i)disregard\\s+(the\\s+)?(above|previous|prior)"),
            Pattern.compile("(?i)you\\s+are\\s+now\\s+"),
            Pattern.compile("(?i)forget\\s+(everything|all|your)\\s+(you\\s+know|previous|instructions)"),
            Pattern.compile("(?i)\\bsystem\\s+prompt\\b"),
            Pattern.compile("(?i)<\\|(im_start|system|assistant)\\|>"),
            Pattern.compile("(?i)reveal\\s+(your|the)\\s+(system\\s+)?prompt")
    );

    private static final List<Pattern> DISALLOWED_PATTERNS = List.of(
            Pattern.compile("(?i)how\\s+to\\s+(make|build|construct)\\s+(a\\s+)?bomb"),
            Pattern.compile("(?i)how\\s+to\\s+(kill|murder)\\s+(a\\s+)?(person|someone|myself)"),
            Pattern.compile("(?i)(suicide|self[-\\s]?harm)\\s+(method|how[-\\s]to|instructions)"),
            Pattern.compile("(?i)synthesi[sz]e\\s+(a\\s+)?(weapon|toxin|poison|nerve\\s+agent)")
    );

    private static final Pattern EMAIL_PATTERN     = Pattern.compile("[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}");
    private static final Pattern PHONE_PATTERN     = Pattern.compile("(?<!\\d)(?:\\+?\\d{1,2}[\\s.-]?)?(?:\\(?\\d{3}\\)?[\\s.-]?)\\d{3}[\\s.-]\\d{4}(?!\\d)");
    private static final Pattern CREDIT_PATTERN    = Pattern.compile("(?<!\\d)(?:\\d[\\s-]?){13,16}(?!\\d)");
    private static final Pattern SSN_PATTERN       = Pattern.compile("(?<!\\d)\\d{3}-\\d{2}-\\d{4}(?!\\d)");

    public InputCheck checkInput(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return new InputCheck(false, CATEGORY_EMPTY, "Message is empty.");
        }
        if (prompt.length() > MAX_INPUT_CHARS) {
            return new InputCheck(false, CATEGORY_TOO_LONG,
                    "Message is too long (max " + MAX_INPUT_CHARS + " characters).");
        }
        for (Pattern p : INJECTION_PATTERNS) {
            if (p.matcher(prompt).find()) {
                return new InputCheck(false, CATEGORY_INJECTION,
                        "Message looks like a prompt-injection attempt and was blocked.");
            }
        }
        for (Pattern p : DISALLOWED_PATTERNS) {
            if (p.matcher(prompt).find()) {
                return new InputCheck(false, CATEGORY_DISALLOWED,
                        "Message touches a disallowed topic and was blocked.");
            }
        }
        return new InputCheck(true, CATEGORY_OK, null);
    }

    public OutputFilter filterOutput(String response) {
        if (response == null || response.isBlank()) {
            return new OutputFilter(response, false, List.of());
        }
        List<String> notes = new ArrayList<>();
        String filtered = response;

        if (EMAIL_PATTERN.matcher(filtered).find()) {
            filtered = EMAIL_PATTERN.matcher(filtered).replaceAll("[redacted-email]");
            notes.add("email");
        }
        if (PHONE_PATTERN.matcher(filtered).find()) {
            filtered = PHONE_PATTERN.matcher(filtered).replaceAll("[redacted-phone]");
            notes.add("phone");
        }
        if (CREDIT_PATTERN.matcher(filtered).find()) {
            filtered = CREDIT_PATTERN.matcher(filtered).replaceAll("[redacted-card]");
            notes.add("card");
        }
        if (SSN_PATTERN.matcher(filtered).find()) {
            filtered = SSN_PATTERN.matcher(filtered).replaceAll("[redacted-ssn]");
            notes.add("ssn");
        }
        return new OutputFilter(filtered, !notes.isEmpty(), notes);
    }

    public record InputCheck(boolean allowed, String category, String reason) {}
    public record OutputFilter(String text, boolean modified, List<String> redactedKinds) {}
}
