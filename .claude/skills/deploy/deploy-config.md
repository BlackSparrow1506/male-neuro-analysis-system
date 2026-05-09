# Deploy Configuration

Environment variables and platform settings used by the production deploys.
Treat this as the authoritative checklist — `.env.example` is the source of truth for *what* exists; this file is *where* each var lives in production.

## Backend → Render

Service: `male-neuro-analysis-system` (Web Service, Docker).

| Var                    | Set in Render? | Notes                                              |
|------------------------|----------------|----------------------------------------------------|
| `MONGODB_URI`          | yes            | Atlas SRV string                                   |
| `MONGODB_DATABASE`     | yes            | `maleneuro`                                        |
| `JWT_SECRET`           | yes            | Long random string; rotate by re-issuing all JWTs  |
| `JWT_EXPIRATION_MS`    | yes            | Default 86400000 (24h)                             |
| `GROQ_API_KEY`         | yes            | From console.groq.com                              |
| `GROQ_MODEL`           | yes            | `llama-3.3-70b-versatile`                          |
| `GROQ_HISTORY_LIMIT`   | optional       | Default 10                                         |
| `ELEVENLABS_API_KEY`   | yes            | From elevenlabs.io                                 |
| `RESEND_API_KEY`       | optional       | Only if `MAIL_ENABLED=true` and using Resend       |
| `MAIL_*`               | optional       | SMTP vars; only if `MAIL_ENABLED=true`             |
| `MAIL_ENABLED`         | yes            | `true` in prod                                     |
| `MAIL_FROM`            | yes            | Verified sender                                    |
| `CORS_ALLOWED_ORIGINS` | yes            | Must include the Vercel domain                     |
| `APP_BASE_URL`         | yes            | The Render URL                                     |
| `FRONTEND_URL`         | yes            | The Vercel URL                                     |
| `PORT`                 | auto           | Render sets this; the app must read it             |

Render dashboard: <https://dashboard.render.com>

## Frontend → Vercel

Project: linked to the `Male-neuro-network-frontend` directory.

| Var                  | Set in Vercel? | Notes                                                  |
|----------------------|----------------|--------------------------------------------------------|
| `VITE_API_BASE_URL`  | yes            | The Render backend URL — no trailing slash             |

Build settings:
- Framework: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

Vercel dashboard: <https://vercel.com>

## Adding a new env var

1. Add it to `Male-neuro-network-backend/.env.example` (or the frontend equivalent) with a placeholder value.
2. Document it in the README env table.
3. Add it to Render / Vercel **before** merging the code that depends on it — otherwise the next auto-deploy crashes.

## Rotating secrets

- **`JWT_SECRET`** — rotation invalidates every existing token. Coordinate with users (or do it during a known outage window).
- **API keys** (Groq, ElevenLabs, Resend) — rotate in the provider dashboard, then update Render. No code change needed.
- **Mongo password** — change in Atlas, update `MONGODB_URI` in Render. Brief downtime expected.
