import { test as baseTest, Page, APIRequestContext } from '@playwright/test';
import { PracticeFormPage } from '@pages/practice-form.page';
import { WindowHubPage } from '@pages/window-hub.page';
import { FileHubPage } from '@pages/file-hub.page';
import { WebActions } from '@core/web-actions';
import { WindowManager } from '@core/window-manager';
import { FileActions } from '@core/file-actions';
import { AssertionHelper } from '@core/assertion-helper';
import { ApiClient } from '@core/api-client';
import { Logger } from '@utils/logger';
import { ENV_CONFIG, EnvironmentConfig } from '@config/environment.config';

/**
 * Custom Fixture Type Definitions
 */
export interface FrameworkFixtures {
  // Config & Utils
  env: EnvironmentConfig;
  logger: Logger;

  // Ready-Made Core Action Libraries
  webActions: WebActions;
  windowManager: WindowManager;
  fileActions: FileActions;
  assertHelper: AssertionHelper;

  // API Utility
  apiClient: ApiClient;
  createApiClient: (baseUrl?: string) => ApiClient;

  // Page Object Models
  practiceFormPage: PracticeFormPage;
  windowHubPage: WindowHubPage;
  fileHubPage: FileHubPage;
}

/**
 * Extended Playwright Test Runner with Enterprise Custom Fixtures
 */
export const test = baseTest.extend<FrameworkFixtures>({
  env: async ({}, use) => {
    await use(ENV_CONFIG);
  },

  logger: async ({}, use, testInfo) => {
    const testLogger = new Logger(testInfo.title);
    testLogger.setTestInfo(testInfo);
    testLogger.info(`>>> Starting Test: "${testInfo.title}" [Project: ${testInfo.project.name}]`);
    await use(testLogger);
    testLogger.info(`<<< Completed Test: "${testInfo.title}" [Status: ${testInfo.status}]`);
  },

  webActions: async ({ page, logger }, use) => {
    await use(new WebActions(page, logger));
  },

  windowManager: async ({ context, logger }, use) => {
    await use(new WindowManager(context, logger));
  },

  fileActions: async ({ page, logger }, use) => {
    await use(new FileActions(page, logger));
  },

  assertHelper: async ({ page, logger }, use) => {
    await use(new AssertionHelper(page, logger));
  },

  apiClient: async ({ request, logger }, use) => {
    await use(new ApiClient(request, undefined, logger));
  },

  createApiClient: async ({ request, logger }, use) => {
    await use((customBaseUrl?: string) => new ApiClient(request, customBaseUrl, logger));
  },

  practiceFormPage: async ({ page }, use) => {
    await use(new PracticeFormPage(page));
  },

  windowHubPage: async ({ page }, use) => {
    await use(new WindowHubPage(page));
  },

  fileHubPage: async ({ page }, use) => {
    await use(new FileHubPage(page));
  },
});

export { expect } from '@playwright/test';
