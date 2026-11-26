# ServeRest – Playwright BDD Tests

Automated UI and API tests for product management on [ServeRest](https://serverest.dev), using Playwright, TypeScript and BDD (Gherkin).

## What is tested

- **Frontend** (`front.serverest.dev`): an admin registers a product and sees it in the product list.
- **API** (`serverest.dev`): create, list and get products, including error cases (duplicate name, missing token, non-admin user).

## Setup

```bash
npm install
npx playwright install chromium
```

## Run the tests

```bash
npx bddgen            # generate test files from the .feature files
npx playwright test   # run all tests
```

## Reports

- Cucumber HTML report: `cucumber-report/report.html`
- Traces of failed tests: `test-results/`

## Notes

- Tests run against the public ServeRest environment. Product names are unique (timestamp + random number) to avoid collisions.
- Known issues found during testing are listed in [`bug-report.md`](./bug-report.md).
