# Male Neural Network — Claude Code Context

Full-stack platform for visualising male-brain neural activity in real time.
Loaded automatically at session start. See `README.md` for the public-facing overview.

---

## Tech Stack

| Layer    | Technology                                           |
|----------|------------------------------------------------------|
| Frontend | React 18, Vite, Three.js (`@react-three/fiber`)      |
| Backend  | Spring Boot 3.4, Java 21                             |
| Database | MongoDB Atlas                                        |
| AI       | Groq (LLaMA 3.3 70B)                                 |
| TTS      | ElevenLabs API                                       |
| Email    | Resend / SMTP                                        |
| Auth     | JWT (stateless)                                      |
| Deploy   | Vercel (frontend) · Render (backend) · Docker        |

---

## Repo Layout

```
.
├── Male-neuro-network-backend/    Spring Boot API (Java 21, Maven)
│   └── src/main/java/com/maleneuro/{controller,service,repository,model,config}
├── Male-neuro-network-frontend/   React + Vite SPA
│   └── src/{components,App.jsx,api.js,mobile.css}
├── .claude/                       Claude Code config (rules, commands, agents, hooks, skills)
├── CLAUDE.md                      This file — loaded at session start
├── CLAUDE.local.md                Local-only overrides (gitignored)
└── .mcp.json                      MCP server registrations
```

---

## Commands You Will Run Often

### Backend
```bash
cd Male-neuro-network-backend
./mvnw spring-boot:run         # start dev server on :8080
./mvnw test                    # run unit tests
./mvnw clean package           # build jar in target/
docker build -t maleneuro-api . # container build
```

### Frontend
```bash
cd Male-neuro-network-frontend
npm install
npm run dev                    # Vite dev server on :5173
npm run build                  # production build to dist/
npm run preview                # preview the build
```

---

## Architecture Notes

- **Stateless auth** — every protected request carries a JWT in the `Authorization: Bearer …` header. No server-side sessions.
- **CORS** is configured in `config/` on the backend and driven by the `CORS_ALLOWED_ORIGINS` env var. Adding a new frontend origin always means updating that env var, not hard-coding it.
- **Mongo documents live in `model/`** and are accessed only through `repository/` interfaces — controllers never talk to Mongo directly.
- **Controllers stay thin.** Real work happens in `service/`. If a controller method is more than a few lines, the logic belongs in a service.
- **Frontend calls go through `src/api.js`** — components never call `fetch` directly. Adding a new endpoint means adding a function to `api.js` first.
- **TTS, AI, and email are external services.** Wrap each one in its own service class so it can be mocked or feature-flagged (`MAIL_ENABLED`, etc.).

---

## Detailed Rules

Topic-specific rules live under `.claude/rules/` and are loaded on demand:

- [`rules/code-style.md`](.claude/rules/code-style.md) — Java + JSX style
- [`rules/testing.md`](.claude/rules/testing.md) — JUnit, Mockito, Vitest
- [`rules/api-conventions.md`](.claude/rules/api-conventions.md) — REST, error shape, auth

---

## Local Overrides

Personal preferences that should not be committed go in `CLAUDE.local.md` (gitignored).
