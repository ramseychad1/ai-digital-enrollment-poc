# E2E Enrollment Tests

End-to-end tests for the Enrollment POC application using [Playwright](https://playwright.dev/).

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers (if not already installed)
npx playwright install chromium
```

## Running Tests

```bash
# Run all tests (headless)
npm test

# Run tests with browser visible
npm run test:headed

# Run tests with Playwright UI (interactive mode)
npm run test:ui

# Run tests in debug mode
npm run test:debug

# View test report
npm run test:report
```

## Generating Tests

Playwright can record your browser interactions and generate test code:

```bash
npm run codegen
```

This opens a browser where you can interact with the app, and Playwright generates the test code automatically.

## Project Structure

```
e2e-tests/
├── tests/                    # Test specifications
│   ├── enrollment-flow.spec.ts    # Full enrollment flow tests
│   ├── program-selection.spec.ts  # Program selection tests
│   └── form-builder.spec.ts       # Form builder tests
├── pages/                    # Page Object Models
│   ├── base.page.ts              # Base page class
│   ├── program-selector.page.ts  # Program selector page
│   ├── program-landing.page.ts   # Program landing page
│   ├── enrollment-form.page.ts   # Enrollment form pages
│   └── form-builder.page.ts      # Admin form builder page
├── fixtures/                 # Test data
│   └── test-data.ts              # Patient, insurance, auth data
├── playwright.config.ts      # Playwright configuration
└── package.json
```

## Configuration

The default base URL is `http://localhost:4201`. To change it:

```bash
# Using environment variable
BASE_URL=http://localhost:4200 npm test

# Or modify playwright.config.ts
```

## Test Coverage

### Enrollment Flow (`enrollment-flow.spec.ts`)
- Display program selector with available programs
- Navigate to program landing page
- Complete full enrollment (pages 1 & 2)
- Form data preservation between pages
- Back navigation

### Program Selection (`program-selection.spec.ts`)
- Program selector page display
- Navigation menu links
- Program cards with details
- Enroll button functionality

### Form Builder (`form-builder.spec.ts`)
- 4-step wizard display
- Upload area visibility
- AI analysis button
- Navigation

## Prerequisites

Make sure the frontend application is running before executing tests:

```bash
cd ../frontend
npm start
```

## CI/CD Integration

The config supports CI environments:
- Retries on failures (2 retries in CI)
- Single worker in CI
- Screenshots and videos on failure
- HTML reporter for results
