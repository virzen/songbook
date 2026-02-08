# E2E Tests

This directory contains end-to-end tests for the Songbook application using Playwright.

## Test Coverage

### Functional Tests (`songbook.spec.js`)
- Song CRUD operations (create, read, update, delete)
- Search and filtering
- Import/Export functionality
- Local storage persistence
- Edge cases and validation

### Visual Snapshot Tests (`snapshots.spec.js`)
Visual regression testing to catch unintended UI changes across all major views and states, including mobile viewport.

## Running Tests

### Prerequisites
```bash
npm install
```

### Run all tests (headless)
```bash
npm test
```

### Run only functional tests
```bash
npm test -- tests/songbook.spec.js
```

### Run only snapshot tests
```bash
npm test -- tests/snapshots.spec.js
```

### Update snapshot baselines (after intentional UI changes)
```bash
npm test -- tests/snapshots.spec.js --update-snapshots
```

### Run tests with browser UI
```bash
npm run test:headed
```

### Run tests in interactive mode
```bash
npm run test:ui
```

### View test report
```bash
npm run test:report
```

## CI Integration

Tests run automatically on:
- Every push to `main` or `master` branch
- Every pull request to `main` or `master` branch

The CI workflow is defined in `.github/workflows/playwright.yml`.

## Test Structure

### `songbook.spec.js`
Functional E2E tests covering all features and user interactions.

### `snapshots.spec.js`
Visual regression tests using screenshot comparison. Baseline images stored in `tests/snapshots.spec.js-snapshots/`.

## Writing New Tests

### Functional Tests
1. Add tests to `tests/songbook.spec.js`
2. Follow the existing test structure
3. Test from user perspective (E2E)
4. Include both happy path and edge cases
5. Ensure tests clean up after themselves (use beforeEach hook)

### Snapshot Tests
When making UI changes:
1. Run tests to see visual differences: `npm test -- tests/snapshots.spec.js`
2. Review the diff images in `test-results/`
3. If changes are intentional, update baselines: `npm test -- tests/snapshots.spec.js --update-snapshots`
4. Commit updated snapshot images with your changes

For new UI features:
1. Add snapshot tests to `tests/snapshots.spec.js`
2. Generate baseline: `npm test -- tests/snapshots.spec.js --update-snapshots`
3. Commit the new snapshot images

## Debugging

If a test fails:
1. Run with `npm run test:headed` to see browser actions
2. Use `npm run test:ui` for step-by-step debugging
3. Check screenshots in `test-results/` directory
4. Review the HTML report with `npm run test:report`
