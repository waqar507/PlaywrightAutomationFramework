import { Page, Locator } from '@playwright/test';
import { BasePage } from '@core/base.page';
import { TableComponent } from '@pages/components/table.component';
import { TEST_PATHS } from '@config/test-data.config';

/**
 * Practice Form Page Object Model
 */
export class PracticeFormPage extends BasePage {
  // Locators
  readonly appTitle: Locator;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly singleClickBtn: Locator;
  readonly doubleClickBtn: Locator;
  readonly rightClickBtn: Locator;
  readonly clickStatusBadge: Locator;

  // Dropdown Locators
  readonly countryDropdown: Locator;
  readonly skillsMultiSelect: Locator;
  readonly customRoleTrigger: Locator;
  readonly customRoleSelected: Locator;
  readonly dropdownStatusBadge: Locator;

  // Options Locators
  readonly termsCheckbox: Locator;
  readonly newsletterCheckbox: Locator;
  readonly proRadio: Locator;
  readonly enterpriseRadio: Locator;
  readonly optionsStatusBadge: Locator;

  // Dynamic Components
  readonly employeeTable: TableComponent;

  constructor(page: Page) {
    super(page, 'PracticeFormPage');

    this.appTitle = page.locator('#app-title');
    this.fullNameInput = page.locator('#full-name');
    this.emailInput = page.locator('#user-email');
    this.singleClickBtn = page.locator('#btn-single-click');
    this.doubleClickBtn = page.locator('#btn-double-click');
    this.rightClickBtn = page.locator('#btn-right-click');
    this.clickStatusBadge = page.locator('#click-status');

    this.countryDropdown = page.locator('#country-select');
    this.skillsMultiSelect = page.locator('#skills-select');
    this.customRoleTrigger = page.locator('#custom-role-trigger');
    this.customRoleSelected = page.locator('#custom-role-selected');
    this.dropdownStatusBadge = page.locator('#dropdown-status');

    this.termsCheckbox = page.locator('#chk-terms');
    this.newsletterCheckbox = page.locator('#chk-newsletter');
    this.proRadio = page.locator('#radio-pro');
    this.enterpriseRadio = page.locator('#radio-enterprise');
    this.optionsStatusBadge = page.locator('#options-status');

    this.employeeTable = new TableComponent(page, page.locator('#employees-table'), this.logger);
  }

  /**
   * Navigates directly to the sandbox practice page.
   */
  public async open(): Promise<void> {
    const fileUrl = `file://${TEST_PATHS.SANDBOX_INDEX.replace(/\\/g, '/')}`;
    await this.navigate(fileUrl);
  }

  /**
   * Fills personal details using actions library.
   */
  public async fillPersonalDetails(name: string, email: string): Promise<void> {
    await this.actions.enterText(this.fullNameInput, name, 'Full Name Input', { clearFirst: true });
    await this.actions.enterText(this.emailInput, email, 'Email Input', { clearFirst: true });
  }

  /**
   * Selects country by label.
   */
  public async selectCountry(countryLabel: string): Promise<void> {
    await this.actions.selectByLabel(this.countryDropdown, countryLabel, 'Country Select Dropdown');
  }

  /**
   * Selects country by value.
   */
  public async selectCountryByVal(value: string): Promise<void> {
    await this.actions.selectByValue(this.countryDropdown, value, 'Country Select Dropdown');
  }

  /**
   * Selects multiple technical skills.
   */
  public async selectSkills(skills: string[]): Promise<void> {
    await this.actions.selectMultiple(this.skillsMultiSelect, skills, 'Skills Multi-Select');
  }

  /**
   * Selects role in custom dropdown component.
   */
  public async selectCustomRole(roleName: string): Promise<void> {
    await this.actions.selectCustomDropdown(
      this.customRoleTrigger,
      roleName,
      '#custom-role-menu'
    );
  }
}
