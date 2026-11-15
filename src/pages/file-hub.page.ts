import { Page, Locator } from '@playwright/test';
import { BasePage } from '@core/base.page';
import { DownloadResult } from '@core/file-actions';
import { TEST_PATHS } from '@config/test-data.config';

/**
 * File Hub Page Object Model
 */
export class FileHubPage extends BasePage {
  readonly downloadBtn: Locator;
  readonly downloadStatusBadge: Locator;
  readonly fileInput: Locator;
  readonly uploadStatusBadge: Locator;

  constructor(page: Page) {
    super(page, 'FileHubPage');

    this.downloadBtn = page.locator('#btn-download');
    this.downloadStatusBadge = page.locator('#download-status');
    this.fileInput = page.locator('#file-input');
    this.uploadStatusBadge = page.locator('#upload-status');
  }

  public async open(): Promise<void> {
    const fileUrl = `file://${TEST_PATHS.SANDBOX_FILES.replace(/\\/g, '/')}`;
    await this.navigate(fileUrl);
  }

  /**
   * Downloads sample report file using FileActions library.
   */
  public async downloadSampleReport(customName?: string): Promise<DownloadResult> {
    return await this.fileActions.downloadFile(async () => {
      await this.actions.click(this.downloadBtn, 'Download Sample Report Button');
    }, customName);
  }

  /**
   * Uploads file to the file input element.
   */
  public async uploadTestFile(filePath: string): Promise<void> {
    await this.fileActions.uploadFile(this.fileInput, filePath, 'File Hub Upload Input');
  }
}
