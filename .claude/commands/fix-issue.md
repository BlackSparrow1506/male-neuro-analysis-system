---
description: Investigate and fix a bug end-to-end (root cause, not symptom)
argument-hint: "<issue description or GitHub issue #>"
---

Fix the issue described in `$ARGUMENTS`. Find the root cause — do not patch the symptom.

## Steps

1. **Understand the report.**
   - If `$ARGUMENTS` starts with `#`, fetch the issue with `gh issue view $ARGUMENTS`.
   - Otherwise treat the argument as a free-form description.
   - Note the expected vs actual behaviour, the affected layer (frontend / backend / both), and any reproduction steps.

2. **Reproduce locally before changing code.**
   - Backend reproduction: `./mvnw spring-boot:run` from `Male-neuro-network-backend/`, then hit the relevant endpoint with `curl`.
   - Frontend reproduction: `npm run dev` from `Male-neuro-network-frontend/`, then exercise the UI flow.
   - If you cannot reproduce, say so and ask for clarification — do not guess.

3. **Locate the cause.**
   - Read the relevant service / controller / component end-to-end before editing. Don't skim.
   - Check `backend.log` and the browser console for actual error shapes.

4. **Fix at the right layer.**
   - Validation problems → fix in the controller's request DTO with bean validation, not by adding `if` blocks in the service.
   - Data shape problems → fix the DTO mapping, not the consumer.
   - State problems on the frontend → fix the source of truth (often `App.jsx` or a custom hook), not the leaf component.

5. **Add a regression test.**
   - Backend: a service or controller test that fails before the fix and passes after.
   - Frontend: a Vitest test if the bug is in component logic; a manual browser check for visual bugs (and say so explicitly).

6. **Verify.**
   - `./mvnw test` for backend changes.
   - `npm test` and a manual browser check for frontend changes.

7. **Report.**
   - One paragraph: root cause, the fix, the test you added.
   - List of files touched with `file:line` for the key change.
