import { defineConfig, devices } from '@playwright/test';
import { ENV_CONFIG } from '@config/environment.config';

/**
 * Enterprise Playwright Configuration
 * Supports Multi-Environment Execution, Parallel Scaling, Tag Filtering (Grep), and Comprehensive Artifacts.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: ENV_CONFIG.defaultTimeout,
  expect: {
    timeout: ENV_CONFIG.expectTimeout,
  },

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only, or configure via RETRIES env */
  retries: process.env.CI ? 2 : (process.env.RETRIES ? parseInt(process.env.RETRIES, 10) : 0),

  /* Parallel worker threads allocation */
  workers: process.env.CI
    ? 2
    : (process.env.WORKERS ? parseInt(process.env.WORKERS, 10) : 4),

  /* Enterprise Multi-Reporter Configuration */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit-results.xml' }],
    ['json', { outputFile: 'test-results/summary-results.json' }],
  ],

  /* Shared settings across all projects */
  use: {
    baseURL: ENV_CONFIG.baseUrl,
    headless: ENV_CONFIG.headless,

    /* Artifact capture strategy */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',

    /* Action & Navigation timeouts */
    actionTimeout: 15000,
    navigationTimeout: 30000,

    /* Automatic download handling */
    acceptDownloads: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },

  /* Grep / Tag Matching Configuration */
  // Tag support enabled by default: CLI --grep and --grep-invert seamlessly work
  grep: process.env.TAGS ? new RegExp(process.env.TAGS) : undefined,

  /* Browser & Emulation Execution Matrix */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  /* Output directory for test artifacts */
  outputDir: 'test-results/',
});
