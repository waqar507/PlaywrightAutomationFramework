import { Page, BrowserContext } from '@playwright/test';
import { WebActions } from '@core/web-actions';
import { WindowManager } from '@core/window-manager';
import { FileActions } from '@core/file-actions';
import { AssertionHelper } from '@core/assertion-helper';
import { Logger } from '@utils/logger';
import { ENV_CONFIG } from '@config/environment.config';

/**
 * Enterprise Base Page
 * Foundational class for all Page Object Models, integrating actions, window management,
 * file operations, assertions, and logging.
 */
export abstract class BasePage {
  readonly page: Page;
  readonly context: BrowserContext;
  readonly actions: WebActions;
  readonly windowManager: WindowManager;
  readonly fileActions: FileActions;
  readonly assert: AssertionHelper;
  readonly logger: Logger;

  constructor(page: Page, pageName = 'BasePage') {
    this.page = page;
    this.context = page.context();
    this.logger = new Logger(pageName);
    this.actions = new WebActions(page, this.logger);
    this.windowManager = new WindowManager(this.context, this.logger);
    this.fileActions = new FileActions(page, this.logger);
    this.assert = new AssertionHelper(page, this.logger);
  }

  /**
   * Navigates to a specific URL or relative path prefixed by ENV_CONFIG.baseUrl.
   */
  public async navigate(pathOrUrl = ''): Promise<void> {
    const targetUrl = pathOrUrl.startsWith('http') || pathOrUrl.startsWith('file://')
      ? pathOrUrl
      : `${ENV_CONFIG.baseUrl}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;

    this.logger.info(`Navigating to: ${targetUrl}`);
    await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Returns current page title.
   */
  public async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Returns current page URL.
   */
  public getUrl(): string {
    return this.page.url();
  }

  /**
   * Reloads the current page.
   */
  public async reload(): Promise<void> {
    this.logger.info('Reloading page');
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  /**
   * Navigates back in browser history.
   */
  public async goBack(): Promise<void> {
    this.logger.info('Navigating back in browser history');
    await this.page.goBack();
  }
}
