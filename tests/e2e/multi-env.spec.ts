import { test, expect } from '@fixtures/test.fixture';

test.describe('Multi-Environment Configuration Suite', { tag: ['@smoke', '@sanity', '@env'] }, () => {
  test('Verify active environment configuration schema and properties', async ({ env, logger }) => {
    logger.info(`Validating configuration loaded from ${env.envName}.config.ts`);

    // Verify environment name is one of supported targets
    expect(['dev', 'qa', 'staging', 'prod']).toContain(env.envName);

    // Verify baseUrl is populated
    expect(env.baseUrl).toBeTruthy();
    expect(env.baseUrl).toMatch(/^https?:\/\//);

    // Verify user profile structures
    const adminUser = env.getUser('admin');
    expect(adminUser.username).toBeTruthy();
    expect(adminUser.password).toBeTruthy();
    expect(adminUser.url).toBeTruthy();

    const standardUser = env.getUser('standard');
    expect(standardUser.username).toBeTruthy();
    expect(standardUser.password).toBeTruthy();

    // Verify timeouts are numeric and positive
    expect(env.defaultTimeout).toBeGreaterThan(0);
    expect(env.expectTimeout).toBeGreaterThan(0);

    // Verify helper methods
    if (env.envName === 'qa') {
      expect(env.isQa()).toBe(true);
      expect(env.isProd()).toBe(false);
    } else if (env.envName === 'dev') {
      expect(env.isDev()).toBe(true);
    } else if (env.envName === 'staging') {
      expect(env.isStaging()).toBe(true);
    } else if (env.envName === 'prod') {
      expect(env.isProd()).toBe(true);
    }
  });

  test('Verify capability to resolve different URLs for different users @smoke', async ({ env, logger }) => {
    logger.info(`Testing multi-user URL resolution for environment: "${env.envName}"`);

    // 1. Admin URL
    const adminUrl = env.getUserUrl('admin');
    expect(adminUrl).toBeTruthy();
    expect(adminUrl).toContain('admin');
    logger.info(`Admin Portal URL: ${adminUrl}`);

    // 2. Standard User URL
    const standardUrl = env.getUserUrl('standard');
    expect(standardUrl).toBeTruthy();
    expect(standardUrl).toContain('portal');
    logger.info(`Standard Portal URL: ${standardUrl}`);

    // 3. Vendor URL
    const vendorUrl = env.getUserUrl('vendor');
    expect(vendorUrl).toBeTruthy();
    expect(vendorUrl).toContain('vendor');
    logger.info(`Vendor Portal URL: ${vendorUrl}`);

    // 4. Customer URL with specific subpath
    const customerDashboardUrl = env.getUserUrl('customer', '/dashboard');
    expect(customerDashboardUrl).toBeTruthy();
    expect(customerDashboardUrl).toContain('app');
    expect(customerDashboardUrl).toMatch(/\/dashboard$/);
    logger.info(`Customer Dashboard URL: ${customerDashboardUrl}`);

    // Verify all URLs are distinct across users
    const allUrls = [adminUrl, standardUrl, vendorUrl, customerDashboardUrl];
    const uniqueUrls = new Set(allUrls);
    expect(uniqueUrls.size).toBe(allUrls.length);
  });

  test('Verify environment-specific feature flags and log levels', async ({ env }) => {
    expect(typeof env.featureFlags.experimentalUi).toBe('boolean');
    expect(['DEBUG', 'INFO', 'WARN', 'ERROR']).toContain(env.logLevel);
  });

  test('Verify baseUrl CLI / process.env override when supplied', async ({ env, logger }) => {
    if (process.env.BASE_URL) {
      logger.info(`Validating overridden baseUrl: "${env.baseUrl}"`);
      expect(env.baseUrl).toBe(process.env.BASE_URL);
    } else {
      expect(env.baseUrl).toBeTruthy();
    }
  });
});
