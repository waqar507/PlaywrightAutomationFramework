import {
  Page,
  Locator,
  Frame,
  LocatorScreenshotOptions,
} from '@playwright/test';
import { Logger } from '@utils/logger';
import { ENV_CONFIG, StandardUserRole } from '@config/environment.config';

// Import Playwright's native parameter types directly
export type LocatorClickOptions = Parameters<Locator['click']>[0];
export type LocatorDblclickOptions = Parameters<Locator['dblclick']>[0];
export type LocatorFillOptions = Parameters<Locator['fill']>[1];
export type LocatorClearOptions = Parameters<Locator['clear']>[0];
export type LocatorSelectOptionOptions = Parameters<Locator['selectOption']>[1];
export type LocatorCheckOptions = Parameters<Locator['check']>[0];
export type LocatorHoverOptions = Parameters<Locator['hover']>[0];
export type LocatorDragToOptions = Parameters<Locator['dragTo']>[1];
export type LocatorPressOptions = Parameters<Locator['press']>[1];

export interface TypeOptions extends LocatorFillOptions {
  clearFirst?: boolean;
  delay?: number;
}

/**
 * Enterprise Web Actions Library
 * Performs direct, native Playwright actions with full auto-waiting, auto-retry,
 * and optional clickOptions/delay parameters without artificial redundant wait wrappers.
 */
export class WebActions {
  protected page: Page;
  protected logger: Logger;

  constructor(page: Page, logger?: Logger) {
    this.page = page;
    this.logger = logger || new Logger('WebActions');
  }

  // ==========================================
  // CLICK OPERATIONS (Direct Playwright Auto-Wait)
  // ==========================================

  /**
   * Clicks an element directly. Playwright automatically auto-waits for visibility,
   * stability, receiving events, and enablement before performing the click.
   */
  public async click(
    locator: Locator,
    description = 'element',
    options?: LocatorClickOptions
  ): Promise<void> {
    this.logger.debug(`Clicking on ${description}`);
    await locator.click(options);
  }

  /**
   * Double clicks on an element directly.
   */
  public async doubleClick(
    locator: Locator,
    description = 'element',
    options?: LocatorDblclickOptions
  ): Promise<void> {
    this.logger.debug(`Double clicking on ${description}`);
    await locator.dblclick(options);
  }

  /**
   * Performs a right-click (context menu) directly on an element.
   */
  public async rightClick(
    locator: Locator,
    description = 'element',
    options?: Omit<LocatorClickOptions, 'button'>
  ): Promise<void> {
    this.logger.debug(`Right-clicking on ${description}`);
    await locator.click({ ...options, button: 'right' });
  }

  /**
   * Force clicks an element directly, bypassing actionability checks if needed.
   */
  public async forceClick(
    locator: Locator,
    description = 'element',
    options?: Omit<LocatorClickOptions, 'force'>
  ): Promise<void> {
    this.logger.debug(`Force clicking on ${description}`);
    await locator.click({ ...options, force: true });
  }

  /**
   * Retries clicking an element when transient DOM detachments or overlays occur.
   */
  public async retryClick(
    locator: Locator,
    description = 'element',
    maxRetries = 3,
    options?: LocatorClickOptions
  ): Promise<void> {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        attempts++;
        this.logger.debug(`Retry click on ${description} (Attempt ${attempts}/${maxRetries})`);
        await locator.click(options);
        return;
      } catch (err) {
        if (attempts >= maxRetries) {
          this.logger.error(`Failed to click ${description} after ${maxRetries} attempts`, err);
          throw err;
        }
        await this.page.waitForTimeout(300);
      }
    }
  }

  /**
   * Safely attempts a click, returning true if succeeded or false on timeout without throwing.
   */
  public async safeClick(
    locator: Locator,
    description = 'element',
    options?: LocatorClickOptions
  ): Promise<boolean> {
    try {
      this.logger.debug(`Attempting safe click on ${description}`);
      await locator.click({ timeout: 3000, ...options });
      return true;
    } catch {
      this.logger.warn(`Safe click skipped: ${description} not clickable within timeout`);
      return false;
    }
  }

  /**
   * Clicks an element identified by text content.
   */
  public async clickByText(
    text: string,
    exact = false,
    description?: string,
    options?: LocatorClickOptions
  ): Promise<void> {
    const desc = description || `element with text "${text}"`;
    this.logger.debug(`Clicking ${desc}`);
    await this.page.getByText(text, { exact }).click(options);
  }

  // ==========================================
  // TEXT & INPUT OPERATIONS
  // ==========================================

  /**
   * Enters text into an input field directly with auto-waiting.
   * If a delay is supplied, types sequentially with inter-key pauses.
   */
  public async enterText(
    locator: Locator,
    text: string,
    description = 'input field',
    options?: TypeOptions
  ): Promise<void> {
    this.logger.debug(`Entering text into ${description}`);

    if (options?.clearFirst) {
      await locator.clear();
    }

    if (options?.delay && options.delay > 0) {
      await locator.pressSequentially(text, { delay: options.delay, timeout: options.timeout });
    } else {
      await locator.fill(text, options);
    }
  }

  /**
   * Clears existing text and types sequentially (useful for autocomplete inputs).
   */
  public async clearAndType(
    locator: Locator,
    text: string,
    description = 'input field',
    delay = 50,
    options?: LocatorFillOptions
  ): Promise<void> {
    this.logger.debug(`Clearing and sequentially typing into ${description}`);
    await locator.clear();
    await locator.pressSequentially(text, { delay, timeout: options?.timeout });
  }

  /**
   * Clears the value of an input field directly.
   */
  public async clearText(
    locator: Locator,
    description = 'input field',
    options?: LocatorClearOptions
  ): Promise<void> {
    this.logger.debug(`Clearing text in ${description}`);
    await locator.clear(options);
  }

  /**
   * Presses a specific keyboard key directly on an element.
   */
  public async pressKey(
    locator: Locator,
    key: string,
    description = 'element',
    options?: LocatorPressOptions
  ): Promise<void> {
    this.logger.debug(`Pressing key "${key}" on ${description}`);
    await locator.press(key, options);
  }

  /**
   * Retrieves inner text of an element directly.
   */
  public async getText(locator: Locator, description = 'element'): Promise<string> {
    this.logger.debug(`Retrieving text from ${description}`);
    const text = await locator.innerText();
    return text.trim();
  }

  /**
   * Retrieves input value of an element directly.
   */
  public async getValue(locator: Locator, description = 'input element'): Promise<string> {
    this.logger.debug(`Retrieving value from ${description}`);
    return await locator.inputValue();
  }

  /**
   * Retrieves an attribute value from an element.
   */
  public async getAttribute(
    locator: Locator,
    attributeName: string,
    description = 'element'
  ): Promise<string | null> {
    this.logger.debug(`Retrieving attribute "${attributeName}" from ${description}`);
    return await locator.getAttribute(attributeName);
  }

  // ==========================================
  // DROPDOWN SELECTION OPERATIONS
  // ==========================================

  /**
   * Selects an option from an HTML <select> by value attribute directly.
   */
  public async selectByValue(
    locator: Locator,
    value: string,
    description = 'dropdown',
    options?: LocatorSelectOptionOptions
  ): Promise<string[]> {
    this.logger.debug(`Selecting option by value "${value}" in ${description}`);
    return await locator.selectOption({ value }, options);
  }

  /**
   * Selects an option from an HTML <select> by visible label text directly.
   */
  public async selectByLabel(
    locator: Locator,
    label: string,
    description = 'dropdown',
    options?: LocatorSelectOptionOptions
  ): Promise<string[]> {
    this.logger.debug(`Selecting option by visible label "${label}" in ${description}`);
    return await locator.selectOption({ label }, options);
  }

  /**
   * Selects an option from an HTML <select> by index directly.
   */
  public async selectByIndex(
    locator: Locator,
    index: number,
    description = 'dropdown',
    options?: LocatorSelectOptionOptions
  ): Promise<string[]> {
    this.logger.debug(`Selecting option by index ${index} in ${description}`);
    return await locator.selectOption({ index }, options);
  }

  /**
   * Selects multiple options in a multi-select dropdown directly.
   */
  public async selectMultiple(
    locator: Locator,
    valuesOrLabels: string[],
    description = 'multi-select dropdown',
    options?: LocatorSelectOptionOptions
  ): Promise<string[]> {
    this.logger.debug(`Selecting multiple options [${valuesOrLabels.join(', ')}] in ${description}`);
    return await locator.selectOption(valuesOrLabels, options);
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
    await triggerLocator.click();

    if (searchLocator) {
      await searchLocator.fill(optionText);
    }

    const optionItem = this.page.locator(`${optionsContainerSelector} >> text="${optionText}"`).first();
    await optionItem.click();
  }

  /**
   * Gets the currently selected option text in a <select> element.
   */
  public async getSelectedOptionText(locator: Locator, description = 'dropdown'): Promise<string> {
    this.logger.debug(`Getting selected option text from ${description}`);
    return await locator.locator('option:checked').innerText();
  }

  /**
   * Gets all available option texts in a <select> element.
   */
  public async getAllOptionTexts(locator: Locator, description = 'dropdown'): Promise<string[]> {
    this.logger.debug(`Retrieving all option texts from ${description}`);
    return await locator.locator('option').allInnerTexts();
  }

  // ==========================================
  // CHECKBOX & RADIO BUTTONS
  // ==========================================

  /**
   * Checks a checkbox or radio button directly.
   */
  public async check(
    locator: Locator,
    description = 'checkbox',
    options?: LocatorCheckOptions
  ): Promise<void> {
    this.logger.debug(`Checking ${description}`);
    await locator.check(options);
  }

  /**
   * Unchecks a checkbox directly.
   */
  public async uncheck(
    locator: Locator,
    description = 'checkbox',
    options?: Parameters<Locator['uncheck']>[0]
  ): Promise<void> {
    this.logger.debug(`Unchecking ${description}`);
    await locator.uncheck(options);
  }

  /**
   * Verifies if a checkbox or radio button is checked.
   */
  public async isChecked(locator: Locator, description = 'checkbox'): Promise<boolean> {
    this.logger.debug(`Checking if ${description} is checked`);
    return await locator.isChecked();
  }

  /**
   * Sets checkbox state explicitly to true (checked) or false (unchecked).
   */
  public async setCheckboxState(
    locator: Locator,
    shouldBeChecked: boolean,
    description = 'checkbox'
  ): Promise<void> {
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
   * Hovers over an element directly.
   */
  public async hover(
    locator: Locator,
    description = 'element',
    options?: LocatorHoverOptions
  ): Promise<void> {
    this.logger.debug(`Hovering over ${description}`);
    await locator.hover(options);
  }

  /**
   * Drags a source element and drops it onto a target element directly.
   */
  public async dragAndDrop(
    source: Locator,
    target: Locator,
    description = 'drag-and-drop',
    options?: LocatorDragToOptions
  ): Promise<void> {
    this.logger.debug(`Performing ${description}`);
    await source.dragTo(target, options);
  }

  /**
   * Scrolls an element into view.
   */
  public async scrollIntoView(locator: Locator, description = 'element'): Promise<void> {
    this.logger.debug(`Scrolling ${description} into view`);
    await locator.scrollIntoViewIfNeeded();
  }

  // ==========================================
  // MULTI-USER NAVIGATION SUPPORT
  // ==========================================

  /**
   * Navigates directly to the dedicated portal/entry URL configured for a specific user role.
   */
  public async navigateToUser(role: StandardUserRole | string, subpath = ''): Promise<void> {
    const targetUrl = ENV_CONFIG.getUserUrl(role, subpath);
    this.logger.info(`Navigating to URL for user role "${role}": ${targetUrl}`);
    await this.page.goto(targetUrl);
  }

  // ==========================================
  // ALERTS & DIALOGS
  // ==========================================

  /**
   * Sets up a one-time dialog handler (alert, confirm, prompt) before triggering an action.
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
    const frame =
      this.page.frame({ name: frameSelector }) ||
      this.page.frame({ url: new RegExp(frameSelector) });
    if (!frame) {
      throw new Error(`Frame matching "${frameSelector}" not found`);
    }
    return frame;
  }

  // ==========================================
  // SYNCHRONIZATION & ARTIFACT HELPERS
  // ==========================================

  /**
   * Explicitly waits for an element state (useful for spinners/overlays).
   */
  public async waitForElementState(
    locator: Locator,
    state: 'visible' | 'hidden' | 'attached' | 'detached',
    timeout = 10000,
    description = 'element'
  ): Promise<void> {
    this.logger.debug(`Waiting for ${description} to be ${state}`);
    await locator.waitFor({ state, timeout });
  }

  /**
   * Waits for network idle state.
   */
  public async waitForNetworkIdle(timeout = 15000): Promise<void> {
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
