export default {
  video: true,
  screenshotOnRunFailure: true,
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 10000,
  viewportWidth: 1280,
  viewportHeight: 720,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  e2e: {
    supportFile: false,
    specPattern: 'src/e2e/**/*.cy.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:4200',
    setupNodeEvents(on: any, config: any) {
      // implement node event listeners here
    },
  },
};
