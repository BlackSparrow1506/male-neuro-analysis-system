package com.maleneuro.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Single source of truth for the JSON error shape documented in
 * {@code .claude/rules/api-conventions.md}:
 *
 * <pre>
 * { "error": "NOT_FOUND", "message": "Profile not found" }
 * </pre>
 *
 * Today this class only handles {@link ResponseStatusException} so that
 * controllers and services that throw it (e.g. ProfileController's NOT_FOUND
 * orElseThrow, AdminGuard's FORBIDDEN, GoogleAuthService's UNAUTHORIZED) get
 * a consistently shaped body instead of Spring's default
 * timestamp/path/error envelope.
 *
 * Generic exceptions are intentionally left to Spring's default handler so
 * we don't accidentally mask unexpected behaviour during the SOLID refactor.
 * A future commit can add a fallback {@code @ExceptionHandler(Exception.class)}
 * once endpoint-by-endpoint contracts are pinned down.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == null) status = HttpStatus.INTERNAL_SERVER_ERROR;

        String reason = ex.getReason();
        String code = status.name();
        String message = reason != null ? reason : status.getReasonPhrase();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", code);
        body.put("message", message);

        return ResponseEntity.status(status).body(body);
    }
}
