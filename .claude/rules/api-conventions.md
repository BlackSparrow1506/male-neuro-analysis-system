# API Conventions

All HTTP endpoints live under `/api`. Frontend calls them through `src/api.js`.

## URL Shape

- **Plural nouns** for collections: `/api/profiles`, `/api/profiles/{id}`.
- **Verbs only when no resource fits**: `/api/auth/login`, `/api/auth/resend-verification`, `/api/tts`.
- **Nested under owner** when access is scoped: `/api/chat/{profileId}`, `/api/chat/{profileId}/history`.
- **Lower-kebab** for multi-word path segments. Never `camelCase` in the URL.

## Methods

| Verb   | Use For                                  |
|--------|------------------------------------------|
| GET    | Read; never has side effects              |
| POST   | Create, or actions (`/login`, `/tts`)     |
| PUT    | Full update of an existing resource       |
| DELETE | Remove a resource (cascades documented)   |

## Auth

- Public endpoints live under `/api/auth/{register,login,verify,resend-verification}`.
- Everything else requires `Authorization: Bearer <jwt>`.
- The JWT filter extracts the user; controllers receive the principal via `@AuthenticationPrincipal`. Never re-parse the token in a controller.

## Request / Response Bodies

- **JSON only.** `Content-Type: application/json` on requests with a body; responses likewise.
- **DTOs are records** in `controller/dto/` (or per-controller). Never serialise a Mongo document directly.
- **Field names are `camelCase`** in JSON.
- **Timestamps** — ISO-8601 strings (`2026-05-04T12:34:56Z`), UTC. Don't expose epoch millis.

## Error Shape

A single shape, returned by `@ControllerAdvice`:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Email is required",
  "fields": { "email": "must not be blank" }
}
```

| Status | When                                              |
|--------|---------------------------------------------------|
| 400    | Malformed JSON, missing required field            |
| 401    | Missing/invalid JWT                               |
| 403    | Authenticated but not allowed                     |
| 404    | Resource not found                                |
| 409    | Conflict (e.g. email already registered)          |
| 422    | Semantic validation failure                       |
| 500    | Unhandled — never leak stack traces               |

## Adding a New Endpoint

1. Add the URL to this file's table (in `README.md` too if it's public-facing).
2. Add a function to `frontend/src/api.js` first; let the type/shape drive the backend contract.
3. Implement controller → service → repository.
4. Update CORS env var if a new origin is involved.
