import { Page, Locator, Download } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@utils/logger';
import { TEST_PATHS, COMMON_TIMEOUTS } from '@config/test-data.config';

export interface DownloadResult {
  readonly fileName: string;
  readonly filePath: string;
  readonly fileSize: number;
}

/**
 * Enterprise File Actions Library
 * Manages reliable upload and download operations with automatic validation and directory management.
 */
export class FileActions {
  private page: Page;
  private logger: Logger;

  constructor(page: Page, logger?: Logger) {
    this.page = page;
    this.logger = logger || new Logger('FileActions');
  }

  // ==========================================
  // FILE DOWNLOAD OPERATIONS
  // ==========================================

  /**
   * Triggers an action that initiates a file download, waits for completion,
   * saves the file locally, and validates the downloaded file size.
   */
  public async downloadFile(
    triggerAction: () => Promise<void>,
    customFileName?: string,
    targetDirectory = TEST_PATHS.DOWNLOADS_DIR,
    timeout = COMMON_TIMEOUTS.DOWNLOAD
  ): Promise<DownloadResult> {
    this.logger.info('Preparing to intercept file download');

    if (!fs.existsSync(targetDirectory)) {
      fs.mkdirSync(targetDirectory, { recursive: true });
    }

    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout }),
      triggerAction(),
    ]);

    const suggestedName = download.suggestedFilename();
    const finalFileName = customFileName || `${Date.now()}_${suggestedName}`;
    const destinationPath = path.join(targetDirectory, finalFileName);

    this.logger.info(`Downloading "${suggestedName}" to "${destinationPath}"`);
    await download.saveAs(destinationPath);

    // Validate downloaded file
    const stats = fs.statSync(destinationPath);
    if (!stats.isFile() || stats.size <= 0) {
      throw new Error(`Download validation failed: File at "${destinationPath}" is empty or invalid.`);
    }

    this.logger.info(`Download complete. Saved "${finalFileName}" (${stats.size} bytes)`);

    return {
      fileName: finalFileName,
      filePath: destinationPath,
      fileSize: stats.size,
    };
  }

  /**
   * Verifies that a downloaded file exists and meets the minimum size requirement.
   */
  public verifyFileExists(filePath: string, minSizeBytes = 1): boolean {
    if (!fs.existsSync(filePath)) {
      this.logger.error(`File does not exist: ${filePath}`);
      return false;
    }
    const stats = fs.statSync(filePath);
    const isValid = stats.size >= minSizeBytes;
    this.logger.info(`File verification for "${filePath}": exists=${isValid}, size=${stats.size} bytes`);
    return isValid;
  }

  /**
   * Cleans up / deletes a downloaded file.
   */
  public deleteFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      this.logger.info(`Deleted file: ${filePath}`);
    }
  }

  // ==========================================
  // FILE UPLOAD OPERATIONS
  // ==========================================

  /**
   * Uploads a single file to an <input type="file"> element.
   */
  public async uploadFile(inputLocator: Locator, relativeOrAbsolutePath: string, description = 'file input'): Promise<void> {
    const resolvedPath = path.isAbsolute(relativeOrAbsolutePath)
      ? relativeOrAbsolutePath
      : path.resolve(process.cwd(), relativeOrAbsolutePath);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File to upload does not exist: ${resolvedPath}`);
    }

    this.logger.info(`Uploading file "${resolvedPath}" to ${description}`);
    await inputLocator.waitFor({ state: 'attached', timeout: COMMON_TIMEOUTS.MEDIUM });
    await inputLocator.setInputFiles(resolvedPath);
  }

  /**
   * Uploads multiple files simultaneously to an <input type="file" multiple> element.
   */
  public async uploadMultipleFiles(inputLocator: Locator, filePaths: string[], description = 'multi-file input'): Promise<void> {
    const resolvedPaths = filePaths.map((fp) =>
      path.isAbsolute(fp) ? fp : path.resolve(process.cwd(), fp)
    );

    for (const fp of resolvedPaths) {
      if (!fs.existsSync(fp)) {
        throw new Error(`Upload file does not exist: ${fp}`);
      }
    }

    this.logger.info(`Uploading ${resolvedPaths.length} files to ${description}`);
    await inputLocator.waitFor({ state: 'attached', timeout: COMMON_TIMEOUTS.MEDIUM });
    await inputLocator.setInputFiles(resolvedPaths);
  }

  /**
   * Intercepts a file chooser event triggered by clicking an upload button/zone.
   */
  public async uploadViaFileChooser(
    triggerAction: () => Promise<void>,
    filePath: string,
    timeout = COMMON_TIMEOUTS.MEDIUM
  ): Promise<void> {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File to upload does not exist: ${resolvedPath}`);
    }

    this.logger.info(`Handling file chooser upload with "${resolvedPath}"`);
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser', { timeout }),
      triggerAction(),
    ]);

    await fileChooser.setFiles(resolvedPath);
  }

  /**
   * Clears uploaded files from a file input.
   */
  public async clearUploadedFiles(inputLocator: Locator): Promise<void> {
    this.logger.info('Clearing uploaded files from input');
    await inputLocator.setInputFiles([]);
  }
}
