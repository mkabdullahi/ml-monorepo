import { DashboardPage } from './dashboard.po';

describe('End-to-End User Workflows', () => {
  let dashboard: DashboardPage;

  beforeEach(() => {
    dashboard = new DashboardPage();
    // Set up all mocks for complete workflow testing
    dashboard.mockApiStatus({ is_running: false, detection_mode: 'color' });
    dashboard.mockApiStart();
    dashboard.mockApiStop();
    dashboard.mockApiModeChange('color');
    dashboard.mockApiModeChange('object');
    dashboard.mockApiModeChange('object_yolo');
    dashboard.mockWebSocketConnection();
  });

  it('should complete full color detection workflow', () => {
    // 1. Load dashboard
    dashboard.visitDashboard();
    dashboard.waitForDashboardLoad();

    // 2. Verify initial state (color detection, stopped)
    dashboard.getModeSelect().should('contain', 'Color Detection');
    dashboard.getStartButton().should('not.be.disabled');
    dashboard.getStopButton().should('be.disabled');

    // 3. Start tracking
    dashboard.getStartButton().click();
    cy.wait('@startTracking');

    // 4. Verify tracking started
    dashboard.getStartButton().should('be.disabled');
    dashboard.getStopButton().should('not.be.disabled');

    // 5. Wait for video stream to initialize (mocked)
    dashboard.waitForVideoStream(2000); // Reduced timeout for mocked tests

    // 6. Check stats are updating
    dashboard.waitForStatsUpdate(2000);

    // 7. Stop tracking
    dashboard.getStopButton().click();
    cy.wait('@stopTracking');

    // 8. Verify tracking stopped
    dashboard.getStartButton().should('not.be.disabled');
    dashboard.getStopButton().should('be.disabled');
  });

  it('should switch between all detection modes during tracking', () => {
    dashboard.visitDashboard();
    dashboard.waitForDashboardLoad();

    // Start with color detection
    dashboard.getStartButton().click();
    cy.wait('@startTracking');

    // Switch to object detection (MobileNet SSD)
    dashboard.selectDetectionMode('object');
    cy.wait('@changeMode').its('request.url').should('include', '/api/mode/object');

    // Verify mode changed in UI
    dashboard.getModeSelect().should('contain', 'Object Detection (MobileNet SSD)');

    // Switch to YOLO detection
    dashboard.selectDetectionMode('object_yolo');
    cy.wait('@changeMode').its('request.url').should('include', '/api/mode/object_yolo');

    // Verify mode changed in UI
    dashboard.getModeSelect().should('contain', 'Object Detection (YOLOv8)');

    // Switch back to color detection
    dashboard.selectDetectionMode('color');
    cy.wait('@changeMode').its('request.url').should('include', '/api/mode/color');

    // Stop tracking
    dashboard.getStopButton().click();
    cy.wait('@stopTracking');
  });

  it('should handle settings changes during tracking', () => {
    dashboard.visitDashboard();
    dashboard.waitForDashboardLoad();

    // Start tracking
    dashboard.getStartButton().click();
    cy.wait('@startTracking');

    // Note: Settings sliders would need data-cy attributes for proper testing
    // This is a placeholder for when sliders are properly instrumented
    dashboard.getMinAreaSlider().should('be.visible');
    dashboard.getCameraIndexSlider().should('be.visible');

    // Stop tracking
    dashboard.getStopButton().click();
    cy.wait('@stopTracking');
  });

  it('should display AI narration during object detection', () => {
    // Mock WebSocket messages with narration
    cy.window().then((win) => {
      const mockWebSocket = {
        send: cy.stub(),
        close: cy.stub(),
        onmessage: null,
        onopen: null,
        onclose: null,
        onerror: null,
      };

      // Mock WebSocket to simulate narration messages
      win.WebSocket = function() {
        setTimeout(() => {
          mockWebSocket.onopen?.();
          // Simulate narration message
          mockWebSocket.onmessage?.({
            data: JSON.stringify({
              type: 'frame',
              data: 'mock-base64-image',
              stats: { objects_detected: 2, fps: 25 },
              narration: 'I can see a person and a chair in the scene.'
            })
          });
        }, 100);
        return mockWebSocket;
      };
    });

    dashboard.visitDashboard();
    dashboard.waitForDashboardLoad();

    // Switch to object detection
    dashboard.selectDetectionMode('object');
    cy.wait('@changeMode');

    // Start tracking
    dashboard.getStartButton().click();
    cy.wait('@startTracking');

    // Verify narration appears
    dashboard.getNarrationText().should('not.be.empty');

    // Stop tracking
    dashboard.getStopButton().click();
    cy.wait('@stopTracking');
  });

  it('should handle rapid start/stop cycles', () => {
    dashboard.visitDashboard();
    dashboard.waitForDashboardLoad();

    // Rapid start/stop cycles
    for (let i = 0; i < 3; i++) {
      dashboard.getStartButton().click();
      cy.wait('@startTracking');

      dashboard.getStopButton().should('not.be.disabled');

      dashboard.getStopButton().click();
      cy.wait('@stopTracking');

      dashboard.getStartButton().should('not.be.disabled');
    }
  });

  it('should maintain state across page refreshes', () => {
    dashboard.visitDashboard();
    dashboard.waitForDashboardLoad();

    // Change mode
    dashboard.selectDetectionMode('object');
    cy.wait('@changeMode');

    // Refresh page
    cy.reload();

    // Should reload with API state
    dashboard.waitForDashboardLoad();
    cy.wait('@getStatus');
  });

  it('should handle offline/network failure scenarios', () => {
    // Start with working connection
    dashboard.visitDashboard();
    dashboard.waitForDashboardLoad();

    // Simulate network failure
    cy.intercept('POST', '**/api/*', { forceNetworkError: true }).as('networkError');

    // Try to start tracking - should handle gracefully
    dashboard.getStartButton().click();

    // Should still show UI elements
    dashboard.getAppContainer().should('be.visible');
    dashboard.getControlPanel().should('be.visible');
  });

  it('should support keyboard navigation', () => {
    dashboard.visitDashboard();
    dashboard.waitForDashboardLoad();

    // Tab through interactive elements
    cy.get('body').tab();
    cy.focused().should('be.visible');

    // Space/Enter should work on buttons
    dashboard.getStartButton().focus().type('{enter}');
    cy.wait('@startTracking');
  });
});
