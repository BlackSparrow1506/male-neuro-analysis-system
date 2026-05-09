# Testing

## Backend (JUnit 5 + Mockito)

- Test files mirror source: `src/test/java/com/maleneuro/<package>/<Class>Test.java`.
- **Service tests** — pure unit tests. Mock repositories and external clients (`GroqClient`, `ElevenLabsClient`, mailer). Use `@ExtendWith(MockitoExtension.class)`.
- **Controller tests** — `@WebMvcTest(MyController.class)` with `MockMvc`. Mock the service layer with `@MockBean`. Assert status + JSON shape.
- **Repository / integration tests** — only when the query is non-trivial. Use Testcontainers Mongo, never embedded fakes — fakes drift from real Mongo behaviour.
- **Naming** — `methodUnderTest_state_expectedOutcome`, e.g. `register_emailAlreadyExists_returns409`.
- **Run** — `./mvnw test` from the backend directory.

## Frontend (Vitest + React Testing Library)

- Test file beside the component: `Foo.jsx` → `Foo.test.jsx`.
- **Test behaviour, not implementation.** Query by accessible role/text (`getByRole`, `findByText`); avoid `getByTestId` unless there is no other handle.
- **Mock the network at `api.js`**, not at `fetch`. Components import from `api.js`, so that's the seam.
- **Three.js / canvas components** — render in `jsdom` is fine for prop-level tests; visual checks happen in the browser.
- **Run** — `npm test` (Vitest) and `npm run dev` for manual UI checks before claiming a UI task is done.

## What not to do

- **Do not mock MongoDB at the integration layer.** If a test needs Mongo, use Testcontainers.
- **Do not assert on log output** to verify behaviour — assert on returned values, persisted state, or HTTP responses.
- **Do not write tests for trivial getters** or framework-generated code.
