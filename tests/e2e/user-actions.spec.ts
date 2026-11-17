import { test, expect } from '@fixtures/test.fixture';

test.describe('UI User Actions Suite', { tag: ['@regression', '@actions'] }, () => {
  test.beforeEach(async ({ practiceFormPage }) => {
    await practiceFormPage.open();
  });

  test('Verify single, double, and right click operations @smoke', async ({ practiceFormPage }) => {
    // 1. Single Click
    await practiceFormPage.actions.click(practiceFormPage.singleClickBtn, 'Single Click Button');
    await practiceFormPage.assert.assertExactText(
      practiceFormPage.clickStatusBadge,
      'Single Click Recorded',
      'Click Status Badge'
    );

    // 2. Double Click
    await practiceFormPage.actions.doubleClick(practiceFormPage.doubleClickBtn, 'Double Click Button');
    await practiceFormPage.assert.assertExactText(
      practiceFormPage.clickStatusBadge,
      'Double Click Recorded',
      'Click Status Badge'
    );

    // 3. Right Click (Context Menu)
    await practiceFormPage.actions.rightClick(practiceFormPage.rightClickBtn, 'Right Click Button');
    await practiceFormPage.assert.assertExactText(
      practiceFormPage.clickStatusBadge,
      'Right Click Recorded',
      'Click Status Badge'
    );
  });

  test('Verify click with native clickOptions (delay, clickCount, force)', async ({ practiceFormPage }) => {
    // Single click with native delay option (100ms hold between mousedown and mouseup)
    await practiceFormPage.actions.click(practiceFormPage.singleClickBtn, 'Single Click Button with delay', {
      delay: 100,
    });
    await practiceFormPage.assert.assertExactText(
      practiceFormPage.clickStatusBadge,
      'Single Click Recorded',
      'Click Status Badge'
    );

    // Double click using native clickCount: 2 option
    await practiceFormPage.actions.click(practiceFormPage.doubleClickBtn, 'Double Click Button via clickCount', {
      clickCount: 2,
    });
    await practiceFormPage.assert.assertExactText(
      practiceFormPage.clickStatusBadge,
      'Double Click Recorded',
      'Click Status Badge'
    );
  });

  test('Verify text entry, clear, and sequential typing', async ({ practiceFormPage }) => {
    const testName = 'Jane Doe';
    const testEmail = 'jane.doe@enterprise-qa.com';

    await practiceFormPage.fillPersonalDetails(testName, testEmail);

    await practiceFormPage.assert.assertValue(practiceFormPage.fullNameInput, testName, 'Full Name Field');
    await practiceFormPage.assert.assertValue(practiceFormPage.emailInput, testEmail, 'Email Field');

    // Test clear and type
    await practiceFormPage.actions.clearAndType(
      practiceFormPage.fullNameInput,
      'Jane Smith Updated',
      'Full Name Field'
    );
    await practiceFormPage.assert.assertValue(
      practiceFormPage.fullNameInput,
      'Jane Smith Updated',
      'Updated Full Name Field'
    );
  });

  test('Verify checkbox and radio button toggles', async ({ practiceFormPage }) => {
    // Check terms
    await practiceFormPage.actions.check(practiceFormPage.termsCheckbox, 'Terms Checkbox');
    expect(await practiceFormPage.actions.isChecked(practiceFormPage.termsCheckbox)).toBe(true);

    // Uncheck newsletter
    await practiceFormPage.actions.uncheck(practiceFormPage.newsletterCheckbox, 'Newsletter Checkbox');
    expect(await practiceFormPage.actions.isChecked(practiceFormPage.newsletterCheckbox)).toBe(false);

    // Switch radio to enterprise
    await practiceFormPage.actions.check(practiceFormPage.enterpriseRadio, 'Enterprise Plan Radio');
    await practiceFormPage.assert.assertContainsText(
      practiceFormPage.optionsStatusBadge,
      'Plan: enterprise',
      'Options Status'
    );
  });

  test('Verify dynamic table data extraction and row lookup @smoke', async ({ practiceFormPage }) => {
    const table = practiceFormPage.employeeTable;

    // Check row count
    const count = await table.getRowCount();
    expect(count).toBe(3);

    // Verify headers
    const headers = await table.getHeaders();
    expect(headers).toEqual(['ID', 'Name', 'Role', 'Status']);

    // Check specific cell
    const cellValue = await table.getCellValue(0, 1);
    expect(cellValue).toBe('Alex Rivera');

    // Get row data mapped to headers
    const row0 = await table.getRowData(0);
    expect(row0['Name']).toBe('Alex Rivera');
    expect(row0['Role']).toBe('Principal Test Architect');
    expect(row0['Status']).toBe('Active');
  });
});
