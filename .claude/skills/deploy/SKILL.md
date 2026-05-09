---
name: deploy
description: Build and deploy the Male Neural Network stack. Frontend → Vercel, backend → Render via Docker. Trigger when the user asks to deploy, ship, release, push to prod, or build a Docker image.
---

# Deploy Skill

This skill walks through deploying the project to its production targets.

## When to use

- User says: "deploy", "ship it", "push to prod", "release", "build the container".
- A change has merged to `main` and someone is preparing a release.

## What gets deployed where

| Component | Target  | Trigger                        |
|-----------|---------|--------------------------------|
| Frontend  | Vercel  | Push to `main` (auto)          |
| Backend   | Render  | Push to `main` (auto, Docker)  |

Both auto-deploy from `main`. Manual deploys are usually only needed when a deploy fails or env vars change.

## Pre-flight checklist

Always run, in order:

1. `git status` — working tree clean?
2. `git log origin/main..HEAD --oneline` — what's actually shipping?
3. Backend: `cd Male-neuro-network-backend && ./mvnw clean package` — does it build?
4. Backend: `./mvnw test` — do tests pass?
5. Frontend: `cd Male-neuro-network-frontend && npm run build` — does the bundle build?
6. Verify env vars at the target (see `deploy-config.md`) — did anything new get added to `.env.example` that isn't in Render / Vercel yet?

If any step fails, **stop**. Do not deploy a broken build.

## Manual paths (only when auto-deploy is wrong)

### Backend container build (Docker)

```bash
cd Male-neuro-network-backend
docker build -t maleneuro-api:$(git rev-parse --short HEAD) .
docker run --rm -p 8080:8080 --env-file .env maleneuro-api:$(git rev-parse --short HEAD)
```

Smoke test: `curl -s http://localhost:8080/api/auth/me -H "Authorization: Bearer test"` should return 401, not 500.

### Frontend production preview

```bash
cd Male-neuro-network-frontend
npm run build
npm run preview
```

## Post-deploy verification

- Hit `https://male-neuro-analysis-system.onrender.com/actuator/health` (if exposed) or the login endpoint — backend should respond.
- Open `https://male-neuro-analysis-system.vercel.app` — frontend should load and successfully call the backend.
- Check Render logs for any startup errors related to env vars.

See `deploy-config.md` for the full env var list and platform-specific notes.
