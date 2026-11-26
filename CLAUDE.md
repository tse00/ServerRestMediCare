# ServerRestMediCare

## Playwright testing

Playwright tooling for this project lives in `.claude/`. Prefer these over ad-hoc approaches.

### Agents (`.claude/agents/`)

- [`playwright-test-planner`](.claude/agents/playwright-test-planner.md) — explores the app and produces a test plan (saved under `specs/`).
- [`playwright-test-generator`](.claude/agents/playwright-test-generator.md) — turns a test plan item into a Playwright test (saved under `tests/`), using `tests/seed.spec.ts` as the seed.
- [`playwright-test-healer`](.claude/agents/playwright-test-healer.md) — runs, debugs and fixes failing Playwright tests.

Typical flow: planner → generator → healer.

### Skills (`.claude/skills/`)

- [`playwright-cli`](.claude/skills/playwright-cli/SKILL.md) — browser automation and Playwright test work via `playwright-cli`. Reference docs in [`.claude/skills/playwright-cli/references/`](.claude/skills/playwright-cli/references/):
  - [spec-driven-testing](.claude/skills/playwright-cli/references/spec-driven-testing.md)
  - [playwright-tests](.claude/skills/playwright-cli/references/playwright-tests.md)
  - [test-generation](.claude/skills/playwright-cli/references/test-generation.md)
  - [running-code](.claude/skills/playwright-cli/references/running-code.md)
  - [element-attributes](.claude/skills/playwright-cli/references/element-attributes.md)
  - [request-mocking](.claude/skills/playwright-cli/references/request-mocking.md)
  - [session-management](.claude/skills/playwright-cli/references/session-management.md)
  - [storage-state](.claude/skills/playwright-cli/references/storage-state.md)
  - [tracing](.claude/skills/playwright-cli/references/tracing.md)
  - [video-recording](.claude/skills/playwright-cli/references/video-recording.md)

### Layout

- `specs/` — test plans (see `specs/README.md`)
- `tests/` — Playwright tests (`seed.spec.ts` is the seed for generated tests)
