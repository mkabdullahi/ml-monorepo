# CV Detection Dashboard - E2E Tests

This directory contains Cypress end-to-end tests for the Angular CV Detection Dashboard.

## Test Structure

```
src/e2e/
├── dashboard.po.ts          # Page Object Model for dashboard interactions
├── dashboard.cy.ts          # Basic component and UI tests
├── api-integration.cy.ts    # API endpoint and integration tests
├── user-workflows.cy.ts     # End-to-end user journey tests
└── README.md               # This file
```

## Test Categories

### 1. Dashboard Tests (`dashboard.cy.ts`)
- ✅ Dashboard loads successfully
- ✅ All components are visible
- ✅ Control panel initial state
- ✅ Detection mode switching
- ✅ Start/stop tracking workflow
- ✅ Stats and narrator components

### 2. API Integration Tests (`api-integration.cy.ts`)
- ✅ Initial status loading
- ✅ Start/stop tracking API calls
- ✅ Mode change API calls
- ✅ Error handling and timeouts
- ✅ Retry logic for failed requests

### 3. User Workflow Tests (`user-workflows.cy.ts`)
- ✅ Complete detection workflows
- ✅ Multi-mode switching during tracking
- ✅ Settings management
- ✅ AI narration display
- ✅ Rapid start/stop cycles
- ✅ Page refresh state persistence
- ✅ Network failure scenarios
- ✅ Keyboard navigation

## Running Tests

### Local Development
```bash
# Run all e2e tests
npx nx e2e object-detection-ui

# Run tests in interactive mode
npx nx e2e object-detection-ui --watch

# Run specific test file
npx nx e2e object-detection-ui --spec="src/e2e/dashboard.cy.ts"
```

### CI/CD Environment
```bash
# Run with static server (for CI)
npx nx e2e object-detection-ui --configuration=ci

# Run with video recording
npx nx e2e object-detection-ui --record
```

## Test Configuration

### Cypress Config (`cypress.config.ts`)
- **Viewport**: 1280x720 (HD)
- **Timeouts**: 10s default, 10s request, 10s response
- **Retries**: 2 runs in CI, 0 in development
- **Video**: Enabled with screenshots on failure

### TypeScript Config (`tsconfig.e2e.json`)
- Includes Cypress and Node types
- Separate from main app TypeScript config

## Mocking Strategy

### API Mocking
All tests use `cy.intercept()` to mock backend API calls:
- Status endpoint (`GET /api/status`)
- Control endpoints (`POST /api/start`, `POST /api/stop`)
- Mode changes (`POST /api/mode/{mode}`)
- Settings updates (`POST /api/settings`)

### WebSocket Mocking
WebSocket connections are mocked to simulate real-time data:
- Video frame streaming
- Detection statistics updates
- AI narration messages

## Page Object Model

The `DashboardPage` class provides:
- Component selectors and interactions
- API mocking helpers
- Wait utilities for async operations
- Fluent interface for chaining actions

## Best Practices

### Test Organization
- Use descriptive test names
- Group related tests in `describe` blocks
- Keep tests independent and isolated
- Use `beforeEach` for common setup

### Mocking Guidelines
- Mock all external dependencies
- Use realistic test data
- Test both success and error scenarios
- Verify API call parameters and responses

### Wait Strategies
- Avoid `cy.wait(fixed-time)`
- Use conditional waits with assertions
- Mock async operations for faster tests
- Set appropriate timeouts for real scenarios

## Debugging Tests

### Visual Debugging
```typescript
// Add to any test for debugging
cy.pause();                    // Pause execution
cy.debug();                    // Open DevTools
cy.screenshot('debug-point');  // Take screenshot
```

### Network Debugging
```typescript
// Log all network requests
cy.intercept('**', (req) => {
  console.log('Request:', req.url);
}).as('allRequests');

// Check specific request
cy.wait('@apiCall').then((interception) => {
  console.log('Response:', interception.response);
});
```

## Continuous Integration

Tests are configured to run in CI with:
- Static file serving for Angular app
- Video recording of test runs
- Screenshots on test failures
- Parallel execution support

## Extending Tests

### Adding New Test Cases
1. Identify the test category (dashboard, API, workflow)
2. Add methods to `DashboardPage` if needed
3. Write test following existing patterns
4. Update this README with new test descriptions

### Adding New Mock Scenarios
1. Create new mock methods in `DashboardPage`
2. Use `cy.intercept()` for API mocking
3. Simulate WebSocket messages if needed
4. Test both success and failure cases

## Troubleshooting

### Common Issues

**Tests timeout frequently**
- Increase timeout values in `cypress.config.ts`
- Check if mocks are properly intercepting requests
- Verify backend is not actually being called

**WebSocket tests failing**
- Ensure WebSocket mocking is consistent
- Check message format matches expected structure
- Verify timing of mock message delivery

**Component not found**
- Check component selectors in `DashboardPage`
- Ensure Angular app is fully loaded before interactions
- Use `cy.wait()` or `should('be.visible')` for stability

### Performance Optimization
- Mock all external services
- Use `cy.intercept()` instead of real network calls
- Minimize wait times in tests
- Run tests in headless mode for CI
