# Male Neural Network

A full-stack AI-powered platform for visualising and analysing the male brain in real time. Turn your lifestyle data — sleep, stress, focus, emotional state — into a living 3D map of your mind.

## Live

| Service  | URL |
|----------|-----|
| Frontend | https://male-neuro-analysis-system.vercel.app |
| Backend  | https://male-neuro-analysis-system.onrender.com |

---

## What It Is

Most wellness tools treat the brain as a black box. This platform gives men a clear, visual understanding of their own neural activity so that improving focus, managing stress, and building mental resilience becomes something you can *see*, not just feel.

Every metric is rooted in male neuroscience — testosterone-driven motivation circuits, stress-response patterns, and focus architectures specific to the male brain. The goal is to make peer-reviewed neuroscience tangible, personal, and actionable without requiring a background in science.

---

## Core Capabilities

| # | Feature | What It Does |
|---|---------|-------------|
| 01 | **3D Neural Network** | Interactive real-time 3D map of active brain regions. Rotate, zoom, and explore every neural cluster. Nodes pulse with live activity scores derived from your profile data. |
| 02 | **AI Neural Coach** | Describe your mental state in plain language. The AI interprets your input, updates your brain map instantly, and delivers science-backed personalised recommendations. |
| 03 | **Anatomical Brain Scan** | Switch to a clinical perspective for region coherence scores, functional states, and a deeper anatomical understanding of what drives your daily performance. |
| 04 | **Neural Metrics Panel** | Tracks Sleep Quality, Stress Level, Focus Index, Emotional Balance, Creativity, Analytical Thinking, Social Engagement, Physical Activity, Mindfulness, and Cognitive Load — each rendered as a live percentage bar with a neural coherence score. |
| 05 | **Bhagavad Gita Wisdom** | For every metric flagged as "needs work", the platform pairs the actual score with a relevant verse from the Bhagavad Gita — Sanskrit (Devanagari), IAST transliteration, English meaning, the neuroscience impact of the imbalance, and the Gita's prescribed practice. The verse-meaning passage can be translated into 16 languages on the fly while the Sanskrit shloka stays untouched. |

---

## Why the Bhagavad Gita

The neural coach diagnoses *what* is out of balance; the Gita layer answers *what to do about it*. The Gita is one of the oldest systematic texts on the male inner battlefield — Arjuna's anxiety, paralysis, anger, doubt, and search for steadiness map almost cleanly onto modern constructs of low mindfulness, elevated stress, weak focus, and emotional dysregulation. By cross-referencing each weak metric against the situation taxonomy in the Gita (anger, fear, depression, uncontrolled mind, demotivation, losing hope, seeking peace…), the platform pairs measurable neural imbalances with prescriptive verses that have guided practitioners for two and a half millennia. Modern neuroscience names the problem; the Gita prescribes the discipline.

---

## The Science Behind It

The platform models male-specific neural circuits identified in peer-reviewed research:

| Brain Region | Function |
|-------------|----------|
| **BNST / POA Circuit** | Sexual behaviour and mate-seeking; dopamine-driven reward circuitry, developmentally fixed by hormonal exposure |
| **VMHvl Circuit** | Reactive aggression and territorial behaviour; integrates threat cues with testosterone levels |
| **Mesolimbic Dopamine** (VTA → NAcc → PFC) | Reward, motivation, and drive; testosterone potentiates dopamine release in the nucleus accumbens |
| **Right Amygdala** | Emotional memory encoding and threat processing; males show preferential right-hemisphere activation linked to action-oriented memory |
| **Hypothalamus INAH-3** | 2–3× larger in males; governs sex drive, gonadotropin release, and hormonal regulation |
| **Cerebellum** | Motor coordination, spatial navigation, and cognitive processing; males show higher metabolic activity and volume |

Key structural findings incorporated into the model:
- Male brains are optimised for **intra-hemispheric communication** — stronger front-to-back wiring within each hemisphere, supporting perception-to-action coordination
- Higher **white matter density** supports long-distance intra-hemispheric signalling
- Sex-specific neurons account for ~25% of the male neural network (demonstrated in *C. elegans* research), establishing sex-specific circuitry as a fundamental organising principle

---

## Enterprise Capabilities

The platform ships eight enterprise-grade controls layered over the core experience. Each is a distinct branch / commit on `main`, and each wires through to the user-visible dashboard or the admin Governance Panel.

| # | Capability | What it does | Where it lives |
|---|------------|--------------|----------------|
| 1 | **Audit Trails** | Every AI action — chat, TTS, guardrail block, rate-limit reject, agent run — is persisted as an `AuditLog` document with request/response previews, latency, success flag, model name, and an evaluation score. The user sees their own log on the account page; admins see every user's. | `service/AuditLogService` · `model/AuditLog` · `controller/AuditController` · `controller/AdminController` |
| 2 | **Rate Limiting** | Per-user, per-action fixed-window limits on chat (20/min) and TTS (30/min). Rejected requests return HTTP 429 with `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers, and an audit entry. | `service/RateLimitService` · `controller/RateLimitResponses` |
| 3 | **Guardrails** | Hard input/output limits: prompt-injection patterns and disallowed topics rejected with HTTP 422 before reaching the model; PII (email, phone, credit card, SSN) redacted from any model reply before persistence or display. | `service/GuardrailService` |
| 4 | **Circuit Breakers** | Resilience4j retry + circuit breaker on every Groq and ElevenLabs call. Sliding window, 50% failure threshold, 30s open state, 3-call half-open probe. State transitions logged. | `service/llm/GroqLlmClient` · `service/TtsService` · `config/CircuitBreakerLogging` |
| 5 | **Metrics Dashboard** | Live SLA snapshot computed from the audit trail: per-action count, success rate, p50/p95/p99 latency, average eval score, plus the live state of every Resilience4j breaker. Refreshes every 15 seconds on the account page. | `service/MetricsService` · `controller/MetricsController` · `frontend/components/SystemStatus` |
| 6 | **Eval Pipeline** | Every chat reply is scored 0–100 by a deterministic, LLM-free evaluator (length sanity, refusal detection, repetition detection, prompt-token overlap, actionable-verb presence). Score and notes are surfaced in the agent trace and on the dashboard; below threshold triggers a recovery retry. | `service/EvalService` · `service/AgentOrchestratorService` |
| 7 | **Multi-Agent Orchestration** | Each chat reply is a Router → Responder → Validator → optional Recovery run. Steps, latencies, intent, and final score are persisted as an `AgentRun` so the UI can replay the trace. | `service/AgentOrchestratorService` · `model/AgentRun` · `frontend/components/AgentTrace` |
| 8 | **Governance Panel** | Admin-only cross-tenant view: platform-wide counts, rolling SLA snapshot, the most recent audit entries across all users, and the most recent agent runs. Admin role auto-promoted from an `ADMIN_EMAILS` allowlist on register/login. Every admin endpoint guarded by `AdminGuard.assertAdmin`. | `controller/AdminController` · `service/AdminGuard` · `frontend/components/GovernancePanel` |

---

## Architecture & SOLID

The backend follows a strict three-layer split — `controller → service → repository` — and applies the SOLID principles end-to-end. Where a principle is applied, the relevant class is named below so the source can be opened directly.

### Single Responsibility (SRP)

The chat-analysis pipeline used to live inside one 460-line `NeuralAnalysisService` that owned profile CRUD, lifestyle-driven metric math, scorecard classification, neural-connection topology, the multi-agent dispatch, and the audit emission. It carried six unrelated reasons to change. The current shape splits each responsibility into its own collaborator:

| Class | Owns |
|-------|------|
| `ProfileService` | Profile CRUD lifecycle (create, read, update, delete, history teardown) |
| `ProfileMetricsCalculator` | Pure, stateless math: per-metric scoring, brain-region activity, neural connections, weighted coherence, scorecard |
| `MessageMetricsUpdater` | Coordinates the message-driven metric nudges; iterates `MessageTrigger` strategies |
| `ChatAnalysisService` | Chat orchestration: persist user message, run orchestrator, persist reply + agent trace, emit audit |
| `ChatResponseService` | System-prompt assembly, message-list construction, profile-aware degraded fallback |
| `EvalService`, `GuardrailService`, `RateLimitService`, `AuditLogService`, `MetricsService` | One responsibility each, named after it |

### Open/Closed (OCP)

`MessageMetricsUpdater` was a single 90-line method holding eleven back-to-back `if (containsAny(...))` blocks, one per topic. Adding a topic meant editing the updater. Now each topic is a class implementing `MessageTrigger`:

```
StressTrigger · CalmTrigger · FocusTrigger · CreativityTrigger ·
ExerciseTrigger · SocialTrigger · AnalyticalTrigger · MemoryTrigger ·
SleepTrigger · SadnessTrigger · JoyTrigger
```

Spring autowires every `@Component` implementing `MessageTrigger` into the updater, in `@Order` order. Adding a topic is one new file; the updater never changes. The order is locked because clamp([0, 1]) makes some sequences non-commutative.

### Liskov Substitution (LSP)

Every `MessageTrigger` honours the same contract: `matches(lower)` is a pure boolean predicate, `apply(profile, lower)` mutates the profile. No subclass strengthens the precondition or weakens the postcondition. `KeywordMessageTrigger` is the eight-way base for the simple "match any of these substrings" triggers; `SleepTrigger` implements the interface directly because its effect branches on which sub-keyword matched, but its public contract is identical.

### Interface Segregation (ISP)

The LLM port (`LlmClient`) exposes one method, `chatComplete(LlmRequest)`. Callers (`ChatResponseService`, `GitaService`) depend only on what they actually use — there's no `streamComplete`, `embed`, or provider-specific knob to tempt premature coupling.

Mongo data access is split into one `Repository` interface per aggregate (`UserRepository`, `NeuralProfileRepository`, `ChatMessageRepository`, `AgentRunRepository`, `AuditLogRepository`). Services inject only the repositories they touch.

### Dependency Inversion (DIP)

Two services used to call Groq directly: the chat responder (then `GeminiService`, named for an earlier Gemini integration) and the Gita guidance service. Both built the request body, both knew the URL, both unpacked `choices[0].message.content`, and only one had retry / breaker wrapping.

The current shape has a provider-agnostic port:

```
service/llm/LlmClient.java          ← interface
service/llm/GroqLlmClient.java      ← impl (HTTP + @Retry + @CircuitBreaker)
service/ChatResponseService.java    ← depends on LlmClient
service/GitaService.java            ← depends on LlmClient
```

Swapping in OpenAI, Anthropic, or a local LLM is a matter of writing one new `LlmClient` implementation. No domain code has to change.

---

## Design Patterns

| Pattern | Where | Why |
|---------|-------|-----|
| **Strategy** | `service/messagetrigger/*` (eleven triggers) | One class per chat-message topic; the updater iterates over the `List<MessageTrigger>` Spring autowires. New topic = new file, no edit to existing code. |
| **Builder** | `service/llm/SystemPromptBuilder` | Composable assembly of the chat system prompt — persona / metrics table / lifestyle context / response style. The previous 50-line `String.format` is replaced by a fluent chain. |
| **Adapter / Port** | `service/llm/LlmClient` + `GroqLlmClient` | Provider-agnostic chat-completion interface. `GroqLlmClient` adapts the Groq HTTP API to the port. |
| **Facade** | `service/AgentOrchestratorService` | Hides the Router → Responder → Validator → Recovery dance behind a single `run(profile, history, message)` call. Returns one persisted `AgentRun` capturing every step. |
| **Chain of Responsibility** (within Facade) | `AgentOrchestratorService` step pipeline | Each pipeline stage either short-circuits (out-of-scope intent → canned refusal), produces output, or hands off downstream. Recovery is a conditional follow-up. |
| **Template Method** | `messagetrigger/KeywordMessageTrigger` | Base implements `matches` over a fixed keyword list; subclasses implement `applyEffects(profile)`. |
| **Circuit Breaker** | `GroqLlmClient`, `TtsService` (Resilience4j) | Sliding-window failure tracking, 50% threshold, fail-fast when open. State transitions logged via `CircuitBreakerLogging`. |
| **Retry with backoff** | Same | 3 attempts, 500ms initial wait, 2× exponential backoff. Skips `HttpClientErrorException` (4xx) — those don't get retried. |
| **Token bucket / Fixed-window limiter** | `RateLimitService` | Per-user, per-action `(userId, action) → Window` map with a synchronised counter, returns a `Decision` record carrying the verdict + headers. |
| **Filter chain** | `config/JwtFilter` + Spring Security | JWT extraction runs once per request, populates the `SecurityContext` with the user id, downstream controllers receive it via `@AuthenticationPrincipal String userId`. |
| **DTO / Value Object** | Java records throughout: `Decision`, `Result`, `Snapshot`, `ActionStats`, `BreakerStats`, `InputCheck`, `OutputFilter`, `LlmRequest`, `LlmMessage` | Immutable, equality-by-value, no Mongo-shape leakage to the wire. |
| **Specification** | `controller/RateLimitResponses` | Static helpers translate a `Decision` into the right `HttpHeaders` and 429 body shape, used identically by chat and TTS. |
| **Repository** | `repository/*Repository extends MongoRepository` | One per aggregate; controllers never touch Mongo directly. |
| **Composite-update / Pipeline** | `ProfileMetricsCalculator.recomputeAll` | `recomputeInitialMetrics → regenerateConnections → recomputeCoherence → regenerateScorecard` runs as one ordered step every time the profile changes. |

---

## Resilience & Observability

- **Resilience4j circuit breakers and retries** wrap every Groq and ElevenLabs call. Configuration in `application.properties` under `resilience4j.circuitbreaker.instances.{groq,elevenlabs}`.
- **Audit log** persists every AI action with latency, success, eval score, and request/response previews truncated to 240 chars.
- **`/api/metrics`** computes p50/p95/p99 latency, success rate, throughput, and live breaker state for the last hour. Powers the system-status card on the account page.
- **`/api/admin/overview`** exposes platform-wide counts to admins (total users, profiles, audit entries, agent runs).
- **JWT-based stateless auth** — no server-side sessions; CORS is env-driven and explicit.

---

## Our Principles

**Transparency** — Every metric is explained, every region is labelled, every recommendation is justified. No black boxes.

**Precision** — Generic wellness tools do not account for the male brain. Models are calibrated to male neural architecture, hormonal patterns, and behavioural science.

**Accessibility** — Advanced neuroscience should not require a PhD. Complex findings are translated into visual, intuitive experiences.

**Actionability** — Every output is designed to produce a clear, concrete next step — not just information.

---

## Disclaimer

This platform is an educational and self-reflection tool, not a medical device. Visualisations are approximations derived from population-level neuroscience research; individual variation is substantial. Nothing here constitutes clinical diagnosis or professional mental health advice. If any result or insight concerns you, consult a qualified medical or mental health professional.

---

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 18, Vite, Three.js (@react-three/fiber) |
| Backend   | Spring Boot 3.4, Java 21 |
| Database  | MongoDB Atlas |
| AI        | Groq (LLaMA 3.3 70B) via `LlmClient` port |
| TTS       | ElevenLabs API (voice: Adam) |
| Email     | Resend API |
| Auth      | JWT (stateless) · Google Sign-In (ID-token verification) |
| Resilience | Resilience4j (retry + circuit breaker) |
| Deploy    | Vercel (frontend) · Render (backend) · Docker |

---

## Project Structure

```
male-neuro-analysis-system/
├── Male-neuro-network-backend/                     # Spring Boot API
│   ├── src/main/java/com/maleneuro/
│   │   ├── controller/                             # REST endpoints + GlobalExceptionHandler
│   │   ├── model/                                  # MongoDB documents + DTO records
│   │   ├── repository/                             # Spring Data Mongo repositories
│   │   ├── service/                                # Domain services (SRP-split)
│   │   │   ├── messagetrigger/                     # MessageTrigger Strategy classes
│   │   │   └── llm/                                # LlmClient port + GroqLlmClient + SystemPromptBuilder
│   │   └── config/                                 # Security, CORS, JWT, Resilience, RestTemplate
│   ├── Dockerfile
│   └── pom.xml
│
└── Male-neuro-network-frontend/                    # React + Vite
    ├── src/
    │   ├── components/                             # UI (3D, panels, modals, AgentTrace, GovernancePanel)
    │   ├── App.jsx                                 # Root + routing
    │   ├── api.js                                  # Single request() pipeline
    │   ├── auth.js                                 # JWT decode + persist/clear stored auth
    │   ├── constants.js                            # Storage keys, events, API paths, error codes
    │   └── mobile.css
    └── vite.config.js
```

---

## API Endpoints

All endpoints live under `/api`. Public endpoints listed first; everything else requires a valid `Authorization: Bearer <jwt>` header.

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new account |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/google` | Sign in with a Google ID token (auto-registers on first call) |
| GET  | `/api/auth/verify` | Email verification redirect |
| POST | `/api/auth/resend-verification` | Resend verification email |
| GET  | `/api/health` | Liveness probe |

### Auth (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/auth/me` | Current user (`userId`, `username`, `email`, `emailVerified`, `admin`, `createdAt`) |
| PUT    | `/api/auth/password` | Change password |
| DELETE | `/api/auth/account` | Delete account + cascade all profiles, chat, audit |

### Profiles (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/profiles` | List user's profiles |
| POST   | `/api/profiles` | Create profile (initial metrics + connections + coherence + scorecard) |
| GET    | `/api/profiles/{id}` | Read |
| PUT    | `/api/profiles/{id}` | Update lifestyle, recompute metrics |
| DELETE | `/api/profiles/{id}` | Delete profile + chat history |

### Chat (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/chat/{profileId}` | Send a message — guardrail check → rate limit → Router → Responder → Validator → optional Recovery → audit. Returns the assistant `ChatMessage`. |
| GET    | `/api/chat/{profileId}/history` | Chat history, oldest first |
| DELETE | `/api/chat/{profileId}/history` | Clear chat history |
| GET    | `/api/chat/agent-run/{runId}` | Replayable trace of a single chat run |

### TTS (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/tts` | Synthesise speech via ElevenLabs (rate-limited, breaker-protected, audit-logged) |

### Gita Wisdom (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/gita/{profileId}/guidance` | Generate per-weakness Bhagavad Gita guidance cards (Sanskrit + IAST + meaning + impact + practice) |
| POST   | `/api/gita/translate` | Translate the meaning/impact prose of a card; Sanskrit shloka stays in Devanagari |

### Audit (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/audit/me?limit=50` | The caller's own audit log |

### Metrics (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/metrics?windowSeconds=3600` | Rolling SLA snapshot — per-action count / success / p50-p95-p99 latency / avg eval score, plus live circuit-breaker state |

### Admin / Governance (Protected — admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/admin/overview` | Platform-wide counts (users, profiles, audit, agent runs) |
| GET    | `/api/admin/audit?limit=100` | Cross-tenant audit feed |
| GET    | `/api/admin/agent-runs?limit=100` | Cross-tenant recent agent runs |

### Error Shape

`@RestControllerAdvice` (`GlobalExceptionHandler`) maps every `ResponseStatusException` to:

```json
{ "error": "NOT_FOUND", "message": "Profile not found: 6630..." }
```

Special-case error codes returned by specific endpoints:
- `429 RATE_LIMITED` — chat / TTS rate limit; carries `retryAfterSeconds`, `limit`, and `Retry-After` header
- `422 GUARDRAIL_BLOCKED` — input rejected by the guardrail; carries `category` (`PROMPT_INJECTION`, `DISALLOWED_TOPIC`, `TOO_LONG`, `EMPTY`)
- `503 UPSTREAM_UNAVAILABLE` — circuit breaker open

---

## Local Development

### Backend
```bash
cd Male-neuro-network-backend
cp .env.example .env
# Fill in your .env values
./mvnw spring-boot:run
```

### Frontend
```bash
cd Male-neuro-network-frontend
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev
```

---

## Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DATABASE` | Database name (`maleneuro`) |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRATION_MS` | Token lifetime in milliseconds |
| `GROQ_API_KEY` | Groq AI API key |
| `GROQ_MODEL` | Groq model id (default `llama-3.3-70b-versatile`) |
| `GROQ_HISTORY_LIMIT` | Max prior messages sent to the model (default 10) |
| `ELEVENLABS_API_KEY` | ElevenLabs TTS API key |
| `RESEND_API_KEY` | Resend email API key |
| `GOOGLE_CLIENT_ID` | Google OAuth client id (for Sign in with Google) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins |
| `APP_BASE_URL` | Backend public URL |
| `FRONTEND_URL` | Frontend public URL |
| `MAIL_ENABLED` | `true` / `false` |
| `MAIL_FROM` | Sender email address |
| `ADMIN_EMAILS` | Comma-separated allowlist; matching users auto-promoted to admin |
| `RATELIMIT_CHAT_PER_MINUTE` | Default 20 |
| `RATELIMIT_TTS_PER_MINUTE` | Default 30 |

### Frontend
| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend URL |
