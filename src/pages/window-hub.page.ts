import { Page, Locator } from '@playwright/test';
import { BasePage } from '@core/base.page';
import { TEST_PATHS } from '@config/test-data.config';

/**
 * Window & Dialog Test Hub Page Object
 */
export class WindowHubPage extends BasePage {
  readonly windowTitle: Locator;
  readonly newTabLink: Locator;
  readonly popupBtn: Locator;
  readonly alertBtn: Locator;
  readonly confirmBtn: Locator;
  readonly promptBtn: Locator;
  readonly dialogResultBadge: Locator;

  constructor(page: Page) {
    super(page, 'WindowHubPage');

    this.windowTitle = page.locator('#window-title');
    this.newTabLink = page.locator('#link-new-tab');
    this.popupBtn = page.locator('#btn-popup');
    this.alertBtn = page.locator('#btn-alert');
    this.confirmBtn = page.locator('#btn-confirm');
    this.promptBtn = page.locator('#btn-prompt');
    this.dialogResultBadge = page.locator('#dialog-result');
  }

  public async open(): Promise<void> {
    const fileUrl = `file://${TEST_PATHS.SANDBOX_WINDOWS.replace(/\\/g, '/')}`;
    await this.navigate(fileUrl);
  }

  /**
   * Opens a new tab and returns the new Page object.
   */
  public async openNewTab(): Promise<Page> {
    return await this.windowManager.waitForNewTab(async () => {
      await this.actions.click(this.newTabLink, 'Open New Tab Link');
    });
  }

  /**
   * Opens a popup window and returns the new Page object.
   */
  public async openPopupWindow(): Promise<Page> {
    return await this.windowManager.waitForNewTab(async () => {
      await this.actions.click(this.popupBtn, 'Open Popup Button');
    });
  }

  /**
   * Triggers and accepts standard JS alert dialog.
   */
  public async triggerAndAcceptAlert(): Promise<string> {
    return await this.actions.handleDialog(async () => {
      await this.actions.click(this.alertBtn, 'Trigger Alert Button');
    }, 'accept');
  }

  /**
   * Triggers and accepts or dismisses confirm dialog.
   */
  public async triggerConfirmDialog(accept: boolean): Promise<string> {
    return await this.actions.handleDialog(
      async () => {
        await this.actions.click(this.confirmBtn, 'Trigger Confirm Button');
      },
      accept ? 'accept' : 'dismiss'
    );
  }

  /**
   * Triggers prompt dialog and inputs text.
   */
  public async triggerPromptDialog(inputText: string): Promise<string> {
    return await this.actions.handleDialog(
      async () => {
        await this.actions.click(this.promptBtn, 'Trigger Prompt Button');
      },
      'accept',
      inputText
    );
  }
}
