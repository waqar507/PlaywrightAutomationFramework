import { Page, Locator, Frame } from '@playwright/test';
import { Logger } from '@utils/logger';
import { COMMON_TIMEOUTS } from '@config/test-data.config';

export interface ClickOptions {
  force?: boolean;
  timeout?: number;
  clickCount?: number;
  button?: 'left' | 'right' | 'middle';
  delay?: number;
}

export interface TypeOptions {
  clearFirst?: boolean;
  delay?: number;
  timeout?: number;
}

/**
 * Enterprise Web Actions Library
 * Encapsulates robust, auto-waiting, self-healing DOM operations with integrated logging.
 */
export class WebActions {
  protected page: Page;
  protected logger: Logger;

  constructor(page: Page, logger?: Logger) {
    this.page = page;
    this.logger = logger || new Logger('WebActions');
  }

  // ==========================================
  // CLICK OPERATIONS
  // ==========================================

  /**
   * Clicks an element with auto-waiting for visibility and actionability.
   */
  public async click(locator: Locator, description = 'element', options?: ClickOptions): Promise<void> {
    this.logger.debug(`Clicking on ${description}`);
    await locator.waitFor({ state: 'visible', timeout: options?.timeout ?? COMMON_TIMEOUTS.MEDIUM });
    await locator.click({
      force: options?.force ?? false,
      timeout: options?.timeout ?? COMMON_TIMEOUTS.MEDIUM,
      button: options?.button ?? 'left',
      clickCount: options?.clickCount ?? 1,
      delay: options?.delay ?? 0,
    });
  }

  /**
   * Safely attempts to click an element, returning true on success or false on timeout without throwing.
   */
  public async safeClick(locator: Locator, description = 'element', timeout = COMMON_TIMEOUTS.SHORT): Promise<boolean> {
    try {
      this.logger.debug(`Attempting safe click on ${description}`);
      await locator.waitFor({ state: 'visible', timeout });
      await locator.click({ timeout });
      return true;
    } catch {
      this.logger.warn(`Safe click skipped: ${description} not clickable within ${timeout}ms`);
      return false;
    }
  }

  /**
   * Double clicks on an element.
   */
  public async doubleClick(locator: Locator, description = 'element'): Promise<void> {
    this.logger.debug(`Double clicking on ${description}`);
    await locator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    await locator.dblclick({ timeout: COMMON_TIMEOUTS.MEDIUM });
  }

  /**
   * Performs a right-click (context menu) on an element.
   */
  public async rightClick(locator: Locator, description = 'element'): Promise<void> {
    this.logger.debug(`Right-clicking on ${description}`);
    await locator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    await locator.click({ button: 'right', timeout: COMMON_TIMEOUTS.MEDIUM });
  }

  /**
   * Force clicks an element bypassing actionability checks.
   */
  public async forceClick(locator: Locator, description = 'element'): Promise<void> {
    this.logger.debug(`Force clicking on ${description}`);
    await locator.click({ force: true, timeout: COMMON_TIMEOUTS.MEDIUM });
  }

  /**
   * Retries clicking an element up to maxRetries times if transient overlays occur.
   */
  public async retryClick(locator: Locator, description = 'element', maxRetries = 3, retryDelayMs = 500): Promise<void> {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        attempts++;
        this.logger.debug(`Retry click on ${description} (Attempt ${attempts}/${maxRetries})`);
        await locator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.SHORT });
        await locator.click({ timeout: COMMON_TIMEOUTS.SHORT });
        return;
      } catch (err) {
        if (attempts >= maxRetries) {
          this.logger.error(`Failed to click ${description} after ${maxRetries} attempts`, err);
          throw err;
        }
        await this.page.waitForTimeout(retryDelayMs);
      }
    }
  }

  /**
   * Clicks an element identified by exact or partial text content.
   */
  public async clickByText(text: string, exact = false, description?: string): Promise<void> {
    const desc = description || `element with text "${text}"`;
    this.logger.debug(`Clicking ${desc}`);
    const locator = this.page.getByText(text, { exact });
    await locator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    await locator.click();
  }

  // ==========================================
  // TEXT & INPUT OPERATIONS
  // ==========================================

  /**
   * Enters text into an input or textarea element with auto-waiting.
   */
  public async enterText(locator: Locator, text: string, description = 'input field', options?: TypeOptions): Promise<void> {
    this.logger.debug(`Entering text into ${description}`);
    await locator.waitFor({ state: 'visible', timeout: options?.timeout ?? COMMON_TIMEOUTS.MEDIUM });

    if (options?.clearFirst) {
      await locator.clear({ timeout: options?.timeout ?? COMMON_TIMEOUTS.MEDIUM });
    }

    if (options?.delay && options.delay > 0) {
      await locator.pressSequentially(text, { delay: options.delay });
    } else {
      await locator.fill(text, { timeout: options?.timeout ?? COMMON_TIMEOUTS.MEDIUM });
    }
  }

  /**
   * Clears existing text and types sequentially (useful for autocompletes).
   */
  public async clearAndType(locator: Locator, text: string, description = 'input field', delay = 50): Promise<void> {
    this.logger.debug(`Clearing and sequentially typing into ${description}`);
    await locator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    await locator.clear();
    await locator.pressSequentially(text, { delay });
  }

  /**
   * Clears the value of an input field.
   */
  public async clearText(locator: Locator, description = 'input field'): Promise<void> {
    this.logger.debug(`Clearing text in ${description}`);
    await locator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    await locator.clear();
  }

  /**
   * Presses a specific keyboard key on an element (e.g. 'Enter', 'Tab', 'Escape').
   */
  public async pressKey(locator: Locator, key: string, description = 'element'): Promise<void> {
    this.logger.debug(`Pressing key "${key}" on ${description}`);
    await locator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    await locator.press(key);
  }

  /**
   * Retrieves inner text of an element.
   */
  public async getText(locator: Locator, description = 'element'): Promise<string> {
    this.logger.debug(`Retrieving text from ${description}`);
    await locator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    const text = await locator.innerText();
    return text.trim();
  }

  /**
   * Retrieves input value of an element.
   */
  public async getValue(locator: Locator, description = 'input element'): Promise<string> {
    this.logger.debug(`Retrieving value from ${description}`);
    await locator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    return await locator.inputValue();
  }

  /**
   * Retrieves an attribute value from an element.
   */
  public async getAttribute(locator: Locator, attributeName: string, description = 'element'): Promise<string | null> {
    this.logger.debug(`Retrieving attribute "${attributeName}" from ${description}`);
    await locator.waitFor({ state: 'attached', timeout: COMMON_TIMEOUTS.MEDIUM });
    return await locator.getAttribute(attributeName);
  }

  // ==========================================
  // DROPDOWN SELECTION OPERATIONS
  // ==========================================

  /**
   * Selects an option from a standard HTML <select> by value attribute.
   */
  public async selectByValue(locator: Locator, value: string, description = 'dropdown'): Promise<string[]> {
    this.logger.debug(`Selecting option by value "${value}" in ${description}`);
    await locator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    return await locator.selectOption({ value });
  }

  /**
   * Selects an option from a standard HTML <select> by visible text label.
   */
  public async selectByLabel(locator: Locator, label: string, description = 'dropdown'): Promise<string[]> {
    this.logger.debug(`Selecting option by visible label "${label}" in ${description}`);
    await locator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    return await locator.selectOption({ label });
  }

  /**
   * Selects an option from a standard HTML <select> by zero-based index.
   */
  public async selectByIndex(locator: Locator, index: number, description = 'dropdown'): Promise<string[]> {
    this.logger.debug(`Selecting option by index ${index} in ${description}`);
    await locator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    return await locator.selectOption({ index });
  }

  /**
   * Selects multiple options in a multi-select element.
   */
  public async selectMultiple(locator: Locator, valuesOrLabels: string[], description = 'multi-select dropdown'): Promise<string[]> {
    this.logger.debug(`Selecting multiple options [${valuesOrLabels.join(', ')}] in ${description}`);
    await locator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    return await locator.selectOption(valuesOrLabels);
  }

  /**
   * Selects an item from a custom (React, Ant Design, Material-UI, Div/UL/LI) dropdown component.
   */
  public async selectCustomDropdown(
    triggerLocator: Locator,
    optionText: string,
    optionsContainerSelector = '.dropdown-menu, ul[role="listbox"], .select-options',
    searchLocator?: Locator
  ): Promise<void> {
    this.logger.debug(`Selecting custom dropdown option "${optionText}"`);
    await triggerLocator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    await triggerLocator.click();

    if (searchLocator) {
      await searchLocator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.SHORT });
      await searchLocator.fill(optionText);
    }

    const optionItem = this.page.locator(`${optionsContainerSelector} >> text="${optionText}"`).first();
    await optionItem.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    await optionItem.click();
  }

  /**
   * Gets the currently selected option text in a <select> element.
   */
  public async getSelectedOptionText(locator: Locator, description = 'dropdown'): Promise<string> {
    this.logger.debug(`Getting selected option text from ${description}`);
    await locator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    return await locator.locator('option:checked').innerText();
  }

  /**
   * Gets all available option texts in a <select> element.
   */
  public async getAllOptionTexts(locator: Locator, description = 'dropdown'): Promise<string[]> {
    this.logger.debug(`Retrieving all option texts from ${description}`);
    await locator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    return await locator.locator('option').allInnerTexts();
  }

  // ==========================================
  // CHECKBOX & RADIO BUTTONS
  // ==========================================

  /**
   * Checks a checkbox or radio button if not already checked.
   */
  public async check(locator: Locator, description = 'checkbox'): Promise<void> {
    this.logger.debug(`Checking ${description}`);
    await locator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    await locator.check({ timeout: COMMON_TIMEOUTS.MEDIUM });
  }

  /**
   * Unchecks a checkbox if checked.
   */
  public async uncheck(locator: Locator, description = 'checkbox'): Promise<void> {
    this.logger.debug(`Unchecking ${description}`);
    await locator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    await locator.uncheck({ timeout: COMMON_TIMEOUTS.MEDIUM });
  }

  /**
   * Verifies if a checkbox or radio button is checked.
   */
  public async isChecked(locator: Locator, description = 'checkbox'): Promise<boolean> {
    this.logger.debug(`Checking if ${description} is checked`);
    await locator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    return await locator.isChecked();
  }

  /**
   * Sets checkbox state explicitly to true (checked) or false (unchecked).
   */
  public async setCheckboxState(locator: Locator, shouldBeChecked: boolean, description = 'checkbox'): Promise<void> {
    const currentState = await this.isChecked(locator, description);
    if (currentState !== shouldBeChecked) {
      if (shouldBeChecked) {
        await this.check(locator, description);
      } else {
        await this.uncheck(locator, description);
      }
    }
  }

  // ==========================================
  // MOUSE & GESTURE OPERATIONS
  // ==========================================

  /**
   * Hovers over an element.
   */
  public async hover(locator: Locator, description = 'element'): Promise<void> {
    this.logger.debug(`Hovering over ${description}`);
    await locator.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    await locator.hover();
  }

  /**
   * Drags a source element and drops it onto a target element.
   */
  public async dragAndDrop(source: Locator, target: Locator, description = 'drag-and-drop'): Promise<void> {
    this.logger.debug(`Performing ${description}`);
    await source.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    await target.waitFor({ state: 'visible', timeout: COMMON_TIMEOUTS.MEDIUM });
    await source.dragTo(target);
  }

  /**
   * Scrolls an element into view.
   */
  public async scrollIntoView(locator: Locator, description = 'element'): Promise<void> {
    this.logger.debug(`Scrolling ${description} into view`);
    await locator.waitFor({ state: 'attached', timeout: COMMON_TIMEOUTS.MEDIUM });
    await locator.scrollIntoViewIfNeeded();
  }

  // ==========================================
  // ALERTS & DIALOGS
  // ==========================================

  /**
   * Sets up a one-time dialog handler (alert, confirm, prompt) before triggering action.
   */
  public async handleDialog(
    triggerAction: () => Promise<void>,
    action: 'accept' | 'dismiss' = 'accept',
    promptText?: string
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.page.once('dialog', async (dialog) => {
        try {
          const dialogMessage = dialog.message();
          this.logger.info(`Dialog intercepted: "${dialogMessage}" (Type: ${dialog.type()})`);
          if (action === 'accept') {
            await dialog.accept(promptText);
          } else {
            await dialog.dismiss();
          }
          resolve(dialogMessage);
        } catch (err) {
          reject(err);
        }
      });

      triggerAction().catch(reject);
    });
  }

  // ==========================================
  // IFRAMES & FRAMES
  // ==========================================

  /**
   * Locates a frame by selector or name.
   */
  public getFrame(frameSelector: string): Frame {
    const frame = this.page.frame({ name: frameSelector }) || this.page.frame({ url: new RegExp(frameSelector) });
    if (!frame) {
      throw new Error(`Frame matching "${frameSelector}" not found`);
    }
    return frame;
  }

  // ==========================================
  // WAIT & SYNCHRONIZATION HELPERS
  // ==========================================

  /**
   * Waits for an element to become visible.
   */
  public async waitForElementVisible(locator: Locator, timeout = COMMON_TIMEOUTS.MEDIUM, description = 'element'): Promise<void> {
    this.logger.debug(`Waiting for ${description} to become visible`);
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Waits for an element to become hidden or detached.
   */
  public async waitForElementHidden(locator: Locator, timeout = COMMON_TIMEOUTS.MEDIUM, description = 'element'): Promise<void> {
    this.logger.debug(`Waiting for ${description} to become hidden`);
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Waits for network idle state.
   */
  public async waitForNetworkIdle(timeout = COMMON_TIMEOUTS.MEDIUM): Promise<void> {
    this.logger.debug('Waiting for network idle state');
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Takes a full page or element screenshot.
   */
  public async takeScreenshot(filePath: string, fullPage = true): Promise<Buffer> {
    this.logger.info(`Capturing screenshot to ${filePath}`);
    return await this.page.screenshot({ path: filePath, fullPage });
  }
}
