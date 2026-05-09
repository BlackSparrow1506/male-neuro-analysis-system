---
description: Review pending changes on the current branch (Java + React focus)
argument-hint: "[optional path or PR number]"
---

You are reviewing the pending changes on the current branch. Focus only on what changed.

## Steps

1. Run in parallel:
   - `git status`
   - `git diff origin/main...HEAD` (or `git diff` if no upstream)
   - `git log origin/main..HEAD --oneline` (commit history)
2. If `$ARGUMENTS` is provided:
   - If it looks like a PR number (`#123` or `123`), run `gh pr diff $ARGUMENTS` and `gh pr view $ARGUMENTS`.
   - Otherwise treat it as a path filter and scope the review to that path.
3. Read the rules so the review reflects this project's conventions:
   - `.claude/rules/code-style.md`
   - `.claude/rules/testing.md`
   - `.claude/rules/api-conventions.md`
4. Review the diff for:
   - **Correctness** — does the code do what the commit message claims?
   - **Layering violations** — controllers calling Mongo, components calling `fetch`, services exposing entities, etc.
   - **Auth** — are new endpoints under the right `/api/auth` vs protected split? Is the JWT filter still covering them?
   - **Error shape** — does any new endpoint leak a stack trace or use a non-standard error JSON?
   - **CORS / env** — new frontend origins added without updating `CORS_ALLOWED_ORIGINS`?
   - **Tests** — is there a test for the new behaviour at the right level (service vs controller)?
   - **Secrets** — any API key, JWT secret, or Mongo URI hardcoded?
5. Output a punch list grouped as **Must fix / Should fix / Nits**, with `file:line` references.

Be specific. Generic feedback ("add error handling") is unhelpful; cite the exact line and what should happen instead.
