---
description: "Use when editing tests, Cypress flows, Jest setup, validation scripts, accessibility checks, or deciding which repo command should verify a change."
name: "Testing and Validation"
applyTo:
  - "__tests__/**"
  - "cypress/**"
  - "verify-integration.test.ts"
  - "jest.config.js"
  - "jest.config.json"
  - "cypress.config.ts"
  - "scripts/run-e2e-tests.sh"
  - "eslint-rules/**"
---

# Testing and Validation

- Prefer the narrowest command that can falsify the change before running broader suites.
- Verified commands from [package.json](../../package.json): `npm run check:icon-aria`, `npm run lint`, `npm test`, `npm run test:unit`, `npm run test:integration`, `npm run test:e2e`, `npm run cypress:run`, `npm run cypress:open`, `npm run build`.
- `npm run test:e2e` runs Jest tests under [**tests**/e2e](../../__tests__/e2e); it is not the same as Cypress.
- `npm run test:e2e:open` calls `bash` [scripts/run-e2e-tests.sh](../../scripts/run-e2e-tests.sh) `open`, so use it only when that shell path is appropriate.
- UI accessibility changes should at least run `npm run check:icon-aria`; broader UI changes should usually run `npm run lint` and a relevant test target.

Links:

- [docs/TEST_COVERAGE_PLAN.md](../../docs/TEST_COVERAGE_PLAN.md)
- [cypress/EXECUTION_SUMMARY.md](../../cypress/EXECUTION_SUMMARY.md)
