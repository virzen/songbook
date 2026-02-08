# E2E Tests

This directory contains end-to-end tests for the Songbook application using Playwright.

## Test Coverage

The test suite includes **46 tests** covering all major features from a user perspective:

### Core Functionality (`songbook.spec.js` - 37 tests)
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

### Visual Snapshot Tests (`snapshots.spec.js` - 9 tests)
Visual regression testing to catch unintended UI changes:
- Empty song list view
- Song list with multiple songs
- Add song form (empty)
- Song display with formatted chords
- Edit song form (pre-filled)
- Search results
- Import modal
- Search with no results
- Mobile viewport rendering

Snapshot tests capture screenshots and compare them against baseline images to detect visual changes.

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

Tests are organized into two files:

### `songbook.spec.js` (37 functional tests)
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

### `snapshots.spec.js` (9 visual tests)
- Visual regression tests using screenshot comparison
- Covers all major views and UI states
- Includes mobile viewport testing
- Baseline images stored in `tests/snapshots.spec.js-snapshots/`

## Writing New Tests

### Functional Tests
When adding new features:
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
