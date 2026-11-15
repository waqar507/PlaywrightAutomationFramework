import { Locator, Page, expect } from '@playwright/test';
import { Logger } from '@utils/logger';
import { COMMON_TIMEOUTS } from '@config/test-data.config';

/**
 * Enterprise Assertion Helper
 * Provides fluent, traceable assertions with automated logging.
 */
export class AssertionHelper {
  private page: Page;
  private logger: Logger;

  constructor(page: Page, logger?: Logger) {
    this.page = page;
    this.logger = logger || new Logger('AssertionHelper');
  }

  /**
   * Asserts that an element is visible within the given timeout.
   */
  public async assertVisible(locator: Locator, description = 'element', timeout = COMMON_TIMEOUTS.MEDIUM): Promise<void> {
    this.logger.debug(`Asserting ${description} is visible`);
    await expect(locator, `Expected ${description} to be visible`).toBeVisible({ timeout });
  }

  /**
   * Asserts that an element is hidden or detached.
   */
  public async assertHidden(locator: Locator, description = 'element', timeout = COMMON_TIMEOUTS.MEDIUM): Promise<void> {
    this.logger.debug(`Asserting ${description} is hidden`);
    await expect(locator, `Expected ${description} to be hidden`).toBeHidden({ timeout });
  }

  /**
   * Asserts that an element contains expected text (substring or regex).
   */
  public async assertContainsText(locator: Locator, expectedText: string | RegExp, description = 'element'): Promise<void> {
    this.logger.debug(`Asserting ${description} contains text: "${expectedText}"`);
    await expect(locator, `Expected ${description} to contain "${expectedText}"`).toContainText(expectedText);
  }

  /**
   * Asserts that an element has exact text.
   */
  public async assertExactText(locator: Locator, expectedText: string, description = 'element'): Promise<void> {
    this.logger.debug(`Asserting ${description} has exact text: "${expectedText}"`);
    await expect(locator, `Expected ${description} to have exact text "${expectedText}"`).toHaveText(expectedText);
  }

  /**
   * Asserts an input field has an expected value.
   */
  public async assertValue(locator: Locator, expectedValue: string, description = 'input field'): Promise<void> {
    this.logger.debug(`Asserting ${description} has value "${expectedValue}"`);
    await expect(locator, `Expected ${description} to have value "${expectedValue}"`).toHaveValue(expectedValue);
  }

  /**
   * Asserts an element is enabled.
   */
  public async assertEnabled(locator: Locator, description = 'element'): Promise<void> {
    this.logger.debug(`Asserting ${description} is enabled`);
    await expect(locator, `Expected ${description} to be enabled`).toBeEnabled();
  }

  /**
   * Asserts an element is disabled.
   */
  public async assertDisabled(locator: Locator, description = 'element'): Promise<void> {
    this.logger.debug(`Asserting ${description} is disabled`);
    await expect(locator, `Expected ${description} to be disabled`).toBeDisabled();
  }

  /**
   * Asserts that current page URL contains the expected substring or matches regex.
   */
  public async assertUrlContains(expectedUrlPart: string | RegExp): Promise<void> {
    this.logger.debug(`Asserting URL matches: ${expectedUrlPart}`);
    await expect(this.page, `Expected URL to match "${expectedUrlPart}"`).toHaveURL(expectedUrlPart);
  }

  /**
   * Asserts page title matches expected title.
   */
  public async assertTitle(expectedTitle: string | RegExp): Promise<void> {
    this.logger.debug(`Asserting Page Title matches: "${expectedTitle}"`);
    await expect(this.page, `Expected page title to match "${expectedTitle}"`).toHaveTitle(expectedTitle);
  }
}
