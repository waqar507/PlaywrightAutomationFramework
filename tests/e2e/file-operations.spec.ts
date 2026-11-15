import { test, expect } from '@fixtures/test.fixture';
import { TEST_PATHS } from '@config/test-data.config';
import * as fs from 'fs';

test.describe('File Download & Upload Operations Suite', { tag: ['@regression', '@files'] }, () => {
  test.beforeEach(async ({ fileHubPage }) => {
    await fileHubPage.open();
  });

  test('Download file, verify existence and contents, then cleanup @smoke', async ({ fileHubPage, fileActions }) => {
    // 1. Download file with verification
    const downloadResult = await fileHubPage.downloadSampleReport('custom-enterprise-report.txt');

    expect(downloadResult.fileName).toBe('custom-enterprise-report.txt');
    expect(downloadResult.fileSize).toBeGreaterThan(0);

    // 2. Verify file on disk
    const fileExists = fileActions.verifyFileExists(downloadResult.filePath, 10);
    expect(fileExists).toBe(true);

    // 3. Verify downloaded text contents
    const content = fs.readFileSync(downloadResult.filePath, 'utf-8');
    expect(content).toContain('Enterprise Automation Framework Download Test');
    expect(content).toContain('Status: SUCCESS');

    // 4. Verify UI state
    await fileHubPage.assert.assertContainsText(
      fileHubPage.downloadStatusBadge,
      'Download initiated: enterprise-report.txt',
      'Download Status Badge'
    );

    // 5. Cleanup
    fileActions.deleteFile(downloadResult.filePath);
    expect(fs.existsSync(downloadResult.filePath)).toBe(false);
  });

  test('Upload file and verify successful upload status', async ({ fileHubPage }) => {
    // Upload sample file
    await fileHubPage.uploadTestFile(TEST_PATHS.SAMPLE_UPLOAD_FILE);

    // Verify UI displays the uploaded filename
    await fileHubPage.assert.assertContainsText(
      fileHubPage.uploadStatusBadge,
      'Uploaded File: sample-upload.txt',
      'Upload Status Badge'
    );
  });
});
