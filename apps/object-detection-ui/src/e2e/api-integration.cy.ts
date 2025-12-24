import { DashboardPage } from './dashboard.po';

describe('API Integration Tests', () => {
  let dashboard: DashboardPage;

  beforeEach(() => {
    dashboard = new DashboardPage();
    dashboard.mockWebSocketConnection();
  });

  it('should load initial tracker status from API', () => {
    // Mock specific status response
    dashboard.mockApiStatus({
      is_running: true,
      detection_mode: 'object',
      min_area: 750,
      camera_index: 1
    });

    dashboard.visitDashboard();
    dashboard.waitForDashboardLoad();

    // Verify API call was made
    cy.wait('@getStatus').then((interception) => {
      expect(interception.response?.statusCode).to.equal(200);
    });

    // Note: UI updates based on API response would need data-cy attributes
    // to properly test the displayed values
  });

  it('should handle tracker start API call', () => {
    dashboard.mockApiStatus({ is_running: false });
    dashboard.mockApiStart();

    dashboard.visitDashboard();
    dashboard.waitForDashboardLoad();

    dashboard.getStartButton().click();

    cy.wait('@startTracking').then((interception) => {
      expect(interception.request.method).to.equal('POST');
      expect(interception.request.url).to.include('/api/start');
      expect(interception.response?.body).to.deep.equal({ message: 'Tracker started' });
    });
  });

  it('should handle tracker stop API call', () => {
    dashboard.mockApiStatus({ is_running: true });
    dashboard.mockApiStop();

    dashboard.visitDashboard();
    dashboard.waitForDashboardLoad();

    dashboard.getStopButton().click();

    cy.wait('@stopTracking').then((interception) => {
      expect(interception.request.method).to.equal('POST');
      expect(interception.request.url).to.include('/api/stop');
      expect(interception.response?.body).to.deep.equal({ message: 'Tracker stopped' });
    });
  });

  it('should handle mode change API calls', () => {
    dashboard.mockApiStatus({ detection_mode: 'color' });

    dashboard.visitDashboard();
    dashboard.waitForDashboardLoad();

    // Change to object detection
    dashboard.selectDetectionMode('object');

    cy.wait('@changeMode').then((interception) => {
      expect(interception.request.url).to.include('/api/mode/object');
      expect(interception.response?.body).to.have.property('mode', 'object');
    });

    // Change to YOLO detection
    dashboard.selectDetectionMode('object_yolo');

    cy.wait('@changeMode').then((interception) => {
      expect(interception.request.url).to.include('/api/mode/object_yolo');
      expect(interception.response?.body).to.have.property('mode', 'object_yolo');
    });
  });

  it('should handle API errors gracefully', () => {
    // Mock API failure
    cy.intercept('GET', '**/api/status', { statusCode: 500, body: 'Internal Server Error' }).as('statusError');

    dashboard.visitDashboard();

    // Should still show basic UI even with API errors
    dashboard.getAppContainer().should('be.visible');
    dashboard.getControlPanel().should('be.visible');

    cy.wait('@statusError');
  });

  it('should handle network timeouts', () => {
    // Mock slow API response
    cy.intercept('GET', '**/api/status', { delay: 15000, body: {} }).as('slowStatus');

    dashboard.visitDashboard();

    // Should handle timeout gracefully
    cy.wait('@slowStatus', { timeout: 16000 });
  });

  it('should retry API calls on failure', () => {
    let attemptCount = 0;

    cy.intercept('GET', '**/api/status', (req) => {
      attemptCount++;
      if (attemptCount < 3) {
        req.reply({ statusCode: 500 });
      } else {
        req.reply({ body: { is_running: false, detection_mode: 'color' } });
      }
    }).as('retryStatus');

    dashboard.visitDashboard();

    // Should eventually succeed after retries
    cy.wait('@retryStatus');
    cy.wait('@retryStatus');
    cy.wait('@retryStatus');
  });
});
