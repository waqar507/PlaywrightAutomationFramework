import { test, expect } from '@fixtures/test.fixture';

test.describe('Dropdown Selection Suite', { tag: ['@regression', '@dropdowns'] }, () => {
  test.beforeEach(async ({ practiceFormPage }) => {
    await practiceFormPage.open();
  });

  test('Select native dropdown option by visible label @smoke', async ({ practiceFormPage }) => {
    await practiceFormPage.selectCountry('United Kingdom');
    await practiceFormPage.assert.assertContainsText(
      practiceFormPage.dropdownStatusBadge,
      'Selected Country: United Kingdom (uk)',
      'Dropdown Status Badge'
    );
  });

  test('Select native dropdown option by value', async ({ practiceFormPage }) => {
    await practiceFormPage.selectCountryByVal('de');
    await practiceFormPage.assert.assertContainsText(
      practiceFormPage.dropdownStatusBadge,
      'Selected Country: Germany (de)',
      'Dropdown Status Badge'
    );
  });

  test('Select native dropdown option by zero-based index', async ({ practiceFormPage }) => {
    // Index 4 is India
    await practiceFormPage.actions.selectByIndex(practiceFormPage.countryDropdown, 4, 'Country Dropdown');
    await practiceFormPage.assert.assertContainsText(
      practiceFormPage.dropdownStatusBadge,
      'Selected Country: India (in)',
      'Dropdown Status Badge'
    );
  });

  test('Select multiple options in multi-select dropdown', async ({ practiceFormPage }) => {
    await practiceFormPage.selectSkills(['playwright', 'typescript']);
    await practiceFormPage.assert.assertContainsText(
      practiceFormPage.dropdownStatusBadge,
      'Selected Skills: playwright, typescript',
      'Multi-select Status Badge'
    );
  });

  test('Select option from custom div/ul/li dropdown component @smoke', async ({ practiceFormPage }) => {
    await practiceFormPage.selectCustomRole('Principal Test Architect');
    await practiceFormPage.assert.assertExactText(
      practiceFormPage.customRoleSelected,
      'Principal Test Architect',
      'Custom Role Selected Span'
    );
    await practiceFormPage.assert.assertContainsText(
      practiceFormPage.dropdownStatusBadge,
      'Selected Role: Principal Test Architect',
      'Dropdown Status Badge'
    );
  });
});
