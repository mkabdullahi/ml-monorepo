import { DashboardPage } from './dashboard.po';

describe('CV Detection Dashboard', () => {
  let dashboard: DashboardPage;

  beforeEach(() => {
    dashboard = new DashboardPage();
    // Mock all API calls by default
    dashboard.mockApiStatus();
    dashboard.mockApiStart();
    dashboard.mockApiStop();
    dashboard.mockApiModeChange('color');
    dashboard.mockApiModeChange('object');
    dashboard.mockApiModeChange('object_yolo');
    dashboard.mockWebSocketConnection();

    dashboard.visitDashboard();
    dashboard.waitForDashboardLoad();
  });

  it('should load the dashboard successfully', () => {
    // Verify all main components are present
    dashboard.getAppContainer().should('be.visible');
    dashboard.getControlPanel().should('be.visible');
    dashboard.getVideoDisplay().should('be.visible');
    dashboard.getStatsDashboard().should('be.visible');
    dashboard.getNarrator().should('be.visible');
  });

  it('should display control panel with correct initial state', () => {
    // Verify control panel elements
    dashboard.getStartButton().should('be.visible').and('not.be.disabled');
    dashboard.getStopButton().should('be.visible').and('be.disabled');
    dashboard.getModeSelect().should('contain', 'Color Detection');

    // Verify sliders are present
    dashboard.getMinAreaSlider().should('be.visible');
    dashboard.getCameraIndexSlider().should('be.visible');
  });

  it('should allow switching detection modes', () => {
    // Switch to object detection
    dashboard.selectDetectionMode('object');
    cy.wait('@changeMode').its('request.url').should('include', '/api/mode/object');

    // Switch to YOLO detection
    dashboard.selectDetectionMode('object_yolo');
    cy.wait('@changeMode').its('request.url').should('include', '/api/mode/object_yolo');

    // Switch back to color detection
    dashboard.selectDetectionMode('color');
    cy.wait('@changeMode').its('request.url').should('include', '/api/mode/color');
  });

  it('should handle start/stop tracking workflow', () => {
    // Start tracking
    dashboard.getStartButton().click();
    cy.wait('@startTracking');

    // Verify buttons state after starting
    dashboard.getStartButton().should('be.disabled');
    dashboard.getStopButton().should('not.be.disabled');

    // Stop tracking
    dashboard.getStopButton().click();
    cy.wait('@stopTracking');

    // Verify buttons state after stopping
    dashboard.getStartButton().should('not.be.disabled');
    dashboard.getStopButton().should('be.disabled');
  });

  it('should display stats dashboard', () => {
    dashboard.getStatsContainer().should('be.visible');
    // Note: Actual stats will depend on mocked WebSocket data
  });

  it('should display narrator component', () => {
    dashboard.getNarrator().should('be.visible');
    dashboard.getNarrationText().should('be.visible');
  });

  it('should handle API errors gracefully', () => {
    // Mock API failure
    cy.intercept('GET', '**/api/status', { statusCode: 500 }).as('statusError');

    cy.reload();

    // Should still show basic UI elements even with API errors
    dashboard.getAppContainer().should('be.visible');
    dashboard.getControlPanel().should('be.visible');
  });
});
