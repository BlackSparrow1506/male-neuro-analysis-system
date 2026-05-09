# Code Style

## Java (Spring Boot, src/main/java/com/maleneuro)

- **Java 21.** Prefer records, `var`, pattern matching, and switch expressions where they make code clearer.
- **Package layout is fixed:** `controller`, `service`, `repository`, `model`, `config`. Don't add new top-level packages without a strong reason.
- **Controllers stay thin** — no business logic, no Mongo calls. They validate input, delegate to a service, and shape the response.
- **Services own the work.** One service per domain (`AuthService`, `ChatService`, `TtsService`, …). Inject collaborators via constructor.
- **Repositories extend `MongoRepository<Doc, String>`.** Custom queries go on the repository interface, not in the service.
- **DTOs vs documents** — never return Mongo documents directly from a controller. Map to a DTO/record so the wire format is independent of the storage shape.
- **Naming** — classes `PascalCase`, methods/fields `camelCase`, constants `UPPER_SNAKE`. Booleans read as questions: `isEnabled`, `hasProfile`.
- **Spring annotations** — prefer constructor injection (no `@Autowired` on fields). Mark services `@Service`, controllers `@RestController`, configuration `@Configuration`.
- **Exceptions** — use `ResponseStatusException` for HTTP errors raised from services; let a `@ControllerAdvice` shape the JSON body.

## JavaScript / JSX (frontend src/)

- **React 18 functional components only.** No class components.
- **Hooks first.** State lives in `useState` / `useReducer`; side effects go in `useEffect`. Extract custom hooks once a pattern is reused.
- **API calls go through `src/api.js`.** Components never call `fetch` directly. Adding an endpoint means: add a function to `api.js` first, then call it.
- **Styling** — colocated CSS or `mobile.css` for responsive concerns. Avoid inline styles except for one-off dynamic values.
- **Three.js** lives inside `@react-three/fiber` components — wrap raw Three.js objects in declarative JSX.
- **File naming** — components `PascalCase.jsx`, helpers `camelCase.js`.

## Across the stack

- **No commented-out code.** Delete it; git remembers.
- **No dead branches.** If a feature flag is off forever, remove the off-path.
- **Comment the *why*, not the *what*.** Identifiers explain what; comments explain hidden constraints.
