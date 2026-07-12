# Step definitions — ATS BDD suite

TypeScript step definitions for the Gherkin features in [`../features`](../features):

- [`position-page-loading.steps.ts`](./position-page-loading.steps.ts) → `position-page-loading.feature`
- [`candidate-stage-change.steps.ts`](./candidate-stage-change.steps.ts) → `candidate-stage-change.feature`

## Assumed stack

These steps are written for **Cypress** with the **`@badeball/cypress-cucumber-preprocessor`**, the standard BDD setup for this React + Cypress stack. All code and comments are in English.

## Layout

```
step-definitions/
├── position-page-loading.steps.ts   # steps for the position board loading
├── candidate-stage-change.steps.ts  # steps for moving a candidate across stages
└── support/
    ├── world.ts          # shared, per-scenario domain state (reset in a Before hook)
    ├── selectors.ts      # domain-oriented DOM selectors (no technical IDs)
    ├── atsBackend.ts      # API test doubles (intercepts) + board navigation
    └── dragAndDrop.ts    # accessible keyboard drag & drop for react-beautiful-dnd
```

## Design notes

- **State via a test world.** `Given` steps seed positions, stages, and candidates into a singleton `world`; `When`/`Then` steps read it. It is reset before every scenario for independence.
- **Backend as test doubles.** The board's two GET endpoints and the stage-change PUT endpoint are stubbed with `cy.intercept`, so the UI tests are deterministic. The stage-change request is aliased so it can be awaited and asserted (verifying persistence via `PUT /candidates/:id`).
- **Drag & drop.** Moving a candidate uses react-beautiful-dnd's accessible keyboard interaction (lift, arrow across columns, drop) — more reliable than synthetic mouse events, and expressed in domain terms (no `click`).
- **Invalid-move scenarios** issue the stage-change command straight at the API contract (`cy.request`) because the board UI only ever emits valid identifiers; they assert the backend rejection.
- **Pending frontend behaviour.** A few `Then` steps (not-found notice, failed-save notice, no false optimistic advance) encode intended behaviour that the current frontend does not yet implement. These are marked with `NOTE:` comments and map to documented PRD risks.

## Wiring (when ready to run)

Not required to author the steps, but to execute them:

1. Install dev dependencies in `frontend/`: `cypress`, `@badeball/cypress-cucumber-preprocessor`, and a bundler plugin (e.g. `@bahmutov/cypress-esbuild-preprocessor`).
2. Point the preprocessor's `stepDefinitions` glob at this folder and the `specPattern` at `../features/**/*.feature`.
3. Provide `apiUrl` via Cypress `env` (defaults to `http://localhost:3010`) and run against the frontend dev server at `http://localhost:3000`.
