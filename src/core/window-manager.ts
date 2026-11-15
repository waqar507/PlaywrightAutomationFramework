import { BrowserContext, Page } from '@playwright/test';
import { Logger } from '@utils/logger';
import { COMMON_TIMEOUTS } from '@config/test-data.config';

/**
 * Enterprise Window & Tab Manager
 * Handles multi-tab, popup, and browser context switching gracefully.
 */
export class WindowManager {
  private context: BrowserContext;
  private logger: Logger;

  constructor(context: BrowserContext, logger?: Logger) {
    this.context = context;
    this.logger = logger || new Logger('WindowManager');
  }

  /**
   * Waits for a new browser page/tab to open when an action is executed.
   * Automatically brings the new tab to the front.
   */
  public async waitForNewTab(triggerAction: () => Promise<void>, timeout = COMMON_TIMEOUTS.MEDIUM): Promise<Page> {
    this.logger.info('Waiting for a new tab/window to open');
    const [newPage] = await Promise.all([
      this.context.waitForEvent('page', { timeout }),
      triggerAction(),
    ]);

    await newPage.waitForLoadState('domcontentloaded');
    await newPage.bringToFront();
    this.logger.info(`Switched to new tab with URL: ${newPage.url()}`);
    return newPage;
  }

  /**
   * Returns all currently open pages in the browser context.
   */
  public getAllPages(): Page[] {
    return this.context.pages();
  }

  /**
   * Returns total count of open pages.
   */
  public getPagesCount(): number {
    return this.context.pages().length;
  }

  /**
   * Switches to a page by index (0-based) and brings it to the front.
   */
  public async switchToPageByIndex(index: number): Promise<Page> {
    const pages = this.getAllPages();
    if (index < 0 || index >= pages.length) {
      throw new Error(`Cannot switch to page index ${index}. Total open pages: ${pages.length}`);
    }
    const targetPage = pages[index];
    await targetPage.bringToFront();
    this.logger.info(`Switched to page at index ${index}: ${targetPage.url()}`);
    return targetPage;
  }

  /**
   * Switches to a page matching the given page title (exact string or regex).
   */
  public async switchToPageByTitle(titlePattern: string | RegExp): Promise<Page> {
    this.logger.info(`Searching for tab matching title: ${titlePattern}`);
    const pages = this.getAllPages();

    for (const page of pages) {
      const pageTitle = await page.title();
      const isMatch = typeof titlePattern === 'string'
        ? pageTitle.includes(titlePattern)
        : titlePattern.test(pageTitle);

      if (isMatch) {
        await page.bringToFront();
        this.logger.info(`Switched to tab with title "${pageTitle}" (${page.url()})`);
        return page;
      }
    }

    throw new Error(`No open page found matching title pattern: ${titlePattern}`);
  }

  /**
   * Switches to a page matching the given URL pattern (exact string or regex).
   */
  public async switchToPageByUrl(urlPattern: string | RegExp): Promise<Page> {
    this.logger.info(`Searching for tab matching URL: ${urlPattern}`);
    const pages = this.getAllPages();

    for (const page of pages) {
      const pageUrl = page.url();
      const isMatch = typeof urlPattern === 'string'
        ? pageUrl.includes(urlPattern)
        : urlPattern.test(pageUrl);

      if (isMatch) {
        await page.bringToFront();
        this.logger.info(`Switched to tab with matching URL: ${pageUrl}`);
        return page;
      }
    }

    throw new Error(`No open page found matching URL pattern: ${urlPattern}`);
  }

  /**
   * Closes the specified page and switches back to a fallback page (default index 0).
   */
  public async closePageAndSwitchBack(pageToClose: Page, fallbackIndex = 0): Promise<Page> {
    const url = pageToClose.url();
    this.logger.info(`Closing tab with URL: ${url}`);
    await pageToClose.close();

    const remainingPages = this.getAllPages();
    if (remainingPages.length === 0) {
      throw new Error('All browser pages have been closed.');
    }

    const safeIndex = Math.min(fallbackIndex, remainingPages.length - 1);
    const activePage = remainingPages[safeIndex];
    await activePage.bringToFront();
    this.logger.info(`Switched back to tab at index ${safeIndex}: ${activePage.url()}`);
    return activePage;
  }
}
