import * as path from 'path';

export const TEST_PATHS = {
  UPLOADS_DIR: path.resolve(process.cwd(), 'test-data', 'uploads'),
  DOWNLOADS_DIR: path.resolve(process.cwd(), 'test-data', 'downloads'),
  SAMPLE_UPLOAD_FILE: path.resolve(process.cwd(), 'test-data', 'uploads', 'sample-upload.txt'),
  SANDBOX_INDEX: path.resolve(process.cwd(), 'tests', 'test-sandbox', 'index.html'),
  SANDBOX_WINDOWS: path.resolve(process.cwd(), 'tests', 'test-sandbox', 'windows.html'),
  SANDBOX_FILES: path.resolve(process.cwd(), 'tests', 'test-sandbox', 'files.html'),
};

export const COMMON_TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 15000,
  LONG: 30000,
  DOWNLOAD: 45000,
};
