/**
 * Page Object Model for the CV Detection Dashboard
 * Provides methods to interact with dashboard components and elements
 */
export class DashboardPage {
  // Main app container
  getAppContainer() {
    return cy.get('.app-container');
  }

  // Component selectors
  getControlPanel() {
    return cy.get('app-control-panel');
  }

  getVideoDisplay() {
    return cy.get('app-video-display');
  }

  getStatsDashboard() {
    return cy.get('app-stats-dashboard');
  }

  getNarrator() {
    return cy.get('app-narrator');
  }

  // Control Panel interactions
  getStartButton() {
    return this.getControlPanel().find('button').contains('Start');
  }

  getStopButton() {
    return this.getControlPanel().find('button').contains('Stop');
  }

  getModeSelect() {
    return this.getControlPanel().find('mat-select');
  }

  selectDetectionMode(mode: 'color' | 'object' | 'object_yolo') {
    this.getModeSelect().click();
    return cy.get('mat-option').contains(this.getModeDisplayName(mode)).click();
  }

  getMinAreaSlider() {
    return this.getControlPanel().find('mat-slider').first();
  }

  getCameraIndexSlider() {
    return this.getControlPanel().find('mat-slider').last();
  }

  // Video Display interactions
  getVideoElement() {
    return this.getVideoDisplay().find('img, video, canvas');
  }

  // Stats Dashboard interactions
  getStatsContainer() {
    return this.getStatsDashboard();
  }

  getDetectionStats() {
    return this.getStatsContainer().find('[data-cy=stats-item]');
  }

  getFpsDisplay() {
    return this.getStatsContainer().find('[data-cy=fps-display]');
  }

  // Narrator interactions
  getNarrationText() {
    return this.getNarrator().find('[data-cy=narration-text]');
  }

  // Utility methods
  private getModeDisplayName(mode: string): string {
    const modeNames = {
      color: 'Color Detection',
      object: 'Object Detection (MobileNet SSD)',
      object_yolo: 'Object Detection (YOLOv8)'
    };
    return modeNames[mode as keyof typeof modeNames] || mode;
  }

  // Wait methods for async operations
  waitForVideoStream(timeout = 10000) {
    return this.getVideoElement().should('be.visible', { timeout });
  }

  waitForStatsUpdate(timeout = 5000) {
    return this.getStatsContainer().should('contain', 'fps', { timeout });
  }

  // API mocking helpers
  mockApiStatus(response: any = {}) {
    const defaultResponse = {
      is_running: false,
      detection_mode: 'color',
      enabled_colors: ['Red', 'Blue', 'Yellow', 'Green'],
      camera_index: 0,
      min_area: 500
    };

    cy.intercept('GET', '**/api/status', { ...defaultResponse, ...response }).as('getStatus');
  }

  mockApiStart(response: any = { message: 'Tracker started' }) {
    cy.intercept('POST', '**/api/start', response).as('startTracking');
  }

  mockApiStop(response: any = { message: 'Tracker stopped' }) {
    cy.intercept('POST', '**/api/stop', response).as('stopTracking');
  }

  mockApiModeChange(mode: string, response: any = { mode, message: `Detection mode set to ${mode}` }) {
    cy.intercept('POST', `**/api/mode/${mode}`, response).as('changeMode');
  }

  mockWebSocketConnection() {
    // Mock WebSocket connection - Cypress handles WebSocket differently
    // We'll use cy.intercept for HTTP and simulate WebSocket events
    cy.window().then((win) => {
      // Override WebSocket for testing
      const OriginalWebSocket = win.WebSocket;
      (win as any).WebSocket = class MockWebSocket extends OriginalWebSocket {
        constructor(url: string | URL, protocols?: string | string[]) {
          super(url, protocols);
          // Simulate connection
          setTimeout(() => {
            this.onopen?.(new Event('open'));
          }, 100);
        }

        override send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
          // Handle outgoing messages if needed
        }
      };
    });
  }

  // Navigation and loading
  visitDashboard() {
    cy.visit('/');
    return this;
  }

  waitForDashboardLoad() {
    this.getAppContainer().should('be.visible');
    this.getControlPanel().should('be.visible');
    this.getVideoDisplay().should('be.visible');
    this.getStatsDashboard().should('be.visible');
    this.getNarrator().should('be.visible');
    return this;
  }
}
