import { test, expect } from '@fixtures/test.fixture';

test.describe('Window, Tab & Dialog Handling Suite', { tag: ['@regression', '@windows'] }, () => {
  test.beforeEach(async ({ windowHubPage }) => {
    await windowHubPage.open();
  });

  test('Open new tab, verify URL, and switch back to parent tab @smoke', async ({ windowHubPage, windowManager }) => {
    expect(windowManager.getPagesCount()).toBe(1);

    // 1. Open new tab
    const newTab = await windowHubPage.openNewTab();
    expect(windowManager.getPagesCount()).toBe(2);
    expect(newTab.url()).toContain('tab=child');

    // 2. Close new tab and return to parent tab (index 0)
    const parentPage = await windowManager.closePageAndSwitchBack(newTab, 0);
    expect(windowManager.getPagesCount()).toBe(1);
    expect(parentPage.url()).not.toContain('tab=child');
  });

  test('Open popup window, switch by title, and close popup', async ({ windowHubPage, windowManager }) => {
    const popupPage = await windowHubPage.openPopupWindow();
    expect(windowManager.getPagesCount()).toBe(2);
    expect(popupPage.url()).toContain('popup=1');

    // Switch by title
    const switchedPage = await windowManager.switchToPageByTitle(/Window & Dialog Test Hub/);
    expect(await switchedPage.title()).toBe('Window & Dialog Test Hub');

    // Clean up popup
    await windowManager.closePageAndSwitchBack(popupPage, 0);
    expect(windowManager.getPagesCount()).toBe(1);
  });

  test('Handle JavaScript Alert dialog', async ({ windowHubPage }) => {
    const dialogMessage = await windowHubPage.triggerAndAcceptAlert();
    expect(dialogMessage).toBe('Enterprise Playwright Alert Message!');
    await windowHubPage.assert.assertExactText(
      windowHubPage.dialogResultBadge,
      'Alert was acknowledged',
      'Dialog Result'
    );
  });

  test('Handle JavaScript Confirm dialog (Accept and Dismiss)', async ({ windowHubPage }) => {
    // 1. Accept Confirm
    await windowHubPage.triggerConfirmDialog(true);
    await windowHubPage.assert.assertExactText(
      windowHubPage.dialogResultBadge,
      'Confirm result: Accepted',
      'Dialog Result'
    );

    // 2. Dismiss Confirm
    await windowHubPage.triggerConfirmDialog(false);
    await windowHubPage.assert.assertExactText(
      windowHubPage.dialogResultBadge,
      'Confirm result: Dismissed',
      'Dialog Result'
    );
  });

  test('Handle JavaScript Prompt dialog with input value @smoke', async ({ windowHubPage }) => {
    const customDept = 'Quality Architecture & Strategy';
    await windowHubPage.triggerPromptDialog(customDept);
    await windowHubPage.assert.assertExactText(
      windowHubPage.dialogResultBadge,
      `Prompt entered: ${customDept}`,
      'Dialog Result'
    );
  });
});
