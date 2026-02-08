# E2E Tests

This directory contains end-to-end tests for the Songbook application using Playwright.

## Test Coverage

The test suite covers all major features from a user perspective:

### Core Functionality
- **Song List View**: Empty state, UI elements, search input
- **Add Song**: Form display, validation, saving, cancellation
- **Edit Song**: Pre-filled form, updates, cancellation
- **Delete Song**: Confirmation dialog, successful deletion
- **Song Display**: Chord formatting, lyrics display, navigation

### Advanced Features
- **Search**: Filter by title/artist, case-insensitive search, no results handling
- **Import**: JSON text import, file selection, validation, duplicate handling
- **Export**: Download JSON files
- **Print**: Print button availability
- **Persistence**: Local storage across reloads

### Edge Cases
- Special characters handling
- Empty artist fields
- Multiple chord formats
- Complex lyrics with empty lines

## Running Tests

### Prerequisites
```bash
npm install
```

### Run all tests (headless)
```bash
npm test
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

Tests are organized by feature:
- Song List View
- Add Song Functionality
- Song Display and Navigation
- Edit Song Functionality
- Delete Song Functionality
- Search Functionality
- Import Functionality
- Export Functionality
- Print Functionality
- Song List Sorting
- Local Storage Persistence
- Edge Cases

## Writing New Tests

When adding new features:
1. Add tests to `tests/songbook.spec.js`
2. Follow the existing test structure
3. Test from user perspective (E2E)
4. Include both happy path and edge cases
5. Ensure tests clean up after themselves (use beforeEach hook)

## Debugging

If a test fails:
1. Run with `npm run test:headed` to see browser actions
2. Use `npm run test:ui` for step-by-step debugging
3. Check screenshots in `test-results/` directory
4. Review the HTML report with `npm run test:report`
