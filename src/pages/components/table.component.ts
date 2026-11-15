import { Locator, Page } from '@playwright/test';
import { Logger } from '@utils/logger';

export interface TableRowData {
  [columnHeader: string]: string;
}

/**
 * Reusable Web Table Component
 * Encapsulates table cell extraction, row lookups, and content assertions.
 */
export class TableComponent {
  private page: Page;
  private tableLocator: Locator;
  private logger: Logger;

  constructor(page: Page, tableLocator: Locator, logger?: Logger) {
    this.page = page;
    this.tableLocator = tableLocator;
    this.logger = logger || new Logger('TableComponent');
  }

  /**
   * Retrieves all column header texts.
   */
  public async getHeaders(): Promise<string[]> {
    const headers = await this.tableLocator.locator('thead th').allInnerTexts();
    return headers.map((h) => h.trim());
  }

  /**
   * Retrieves row count in the table body.
   */
  public async getRowCount(): Promise<number> {
    return await this.tableLocator.locator('tbody tr').count();
  }

  /**
   * Retrieves the text contents of a cell by row index and column index (0-based).
   */
  public async getCellValue(rowIndex: number, colIndex: number): Promise<string> {
    const cell = this.tableLocator.locator(`tbody tr:nth-child(${rowIndex + 1}) td:nth-child(${colIndex + 1})`);
    return (await cell.innerText()).trim();
  }

  /**
   * Finds a row locator that contains specific text in any column.
   */
  public getRowByText(text: string): Locator {
    return this.tableLocator.locator('tbody tr', { hasText: text });
  }

  /**
   * Retrieves full row data as key-value pairs mapped to header names.
   */
  public async getRowData(rowIndex: number): Promise<TableRowData> {
    const headers = await this.getHeaders();
    const cells = await this.tableLocator.locator(`tbody tr:nth-child(${rowIndex + 1}) td`).allInnerTexts();

    const rowData: TableRowData = {};
    headers.forEach((header, idx) => {
      rowData[header] = cells[idx]?.trim() || '';
    });
    return rowData;
  }
}
