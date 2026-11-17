import { Page, BrowserContext } from '@playwright/test';
import { WebActions } from '@core/web-actions';
import { WindowManager } from '@core/window-manager';
import { FileActions } from '@core/file-actions';
import { AssertionHelper } from '@core/assertion-helper';
import { Logger } from '@utils/logger';
import { ENV_CONFIG, StandardUserRole, UserProfile } from '@config/environment.config';

/**
 * Enterprise Base Page
 * Foundational class for all Page Object Models, integrating actions, window management,
 * file operations, assertions, logging, and multi-user URL capabilities.
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
   * Navigates to a specific URL or relative path.
   * If a userRole is passed, uses the dedicated URL configured for that user.
   */
  public async navigate(pathOrUrl = '', userRole?: StandardUserRole | string): Promise<void> {
    let targetUrl: string;

    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('file://')) {
      targetUrl = pathOrUrl;
    } else if (userRole) {
      targetUrl = ENV_CONFIG.getUserUrl(userRole, pathOrUrl);
    } else {
      const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
      targetUrl = `${ENV_CONFIG.baseUrl.replace(/\/$/, '')}${cleanPath}`;
    }

    this.logger.info(`Navigating to: ${targetUrl}${userRole ? ` (User Role: ${userRole})` : ''}`);
    await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Navigates directly to the portal / entry URL for a specific user role.
   */
  public async navigateAsUser(userRole: StandardUserRole | string, subpath = ''): Promise<void> {
    const userUrl = ENV_CONFIG.getUserUrl(userRole, subpath);
    this.logger.info(`Navigating as user role "${userRole}" to: ${userUrl}`);
    await this.page.goto(userUrl, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Retrieves the URL configured for a specific user role.
   */
  public getUserUrl(userRole: StandardUserRole | string, subpath = ''): string {
    return ENV_CONFIG.getUserUrl(userRole, subpath);
  }

  /**
   * Retrieves the credentials / profile for a specific user role.
   */
  public getUser(userRole: StandardUserRole | string): UserProfile {
    return ENV_CONFIG.getUser(userRole);
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
