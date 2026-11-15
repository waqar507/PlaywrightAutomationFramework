import { test, expect } from '@fixtures/test.fixture';

test.describe('Multi-Environment Configuration Suite', { tag: ['@smoke', '@sanity', '@env'] }, () => {
  test('Verify active environment configuration schema and properties', async ({ env, logger }) => {
    logger.info(`Validating configuration for environment: "${env.envName}"`);

    // Verify environment name is one of supported targets
    expect(['dev', 'qa', 'staging', 'prod']).toContain(env.envName);

    // Verify baseUrl is populated
    expect(env.baseUrl).toBeTruthy();
    expect(env.baseUrl).toMatch(/^https?:\/\//);

    // Verify credentials structure
    expect(env.credentials.admin.username).toBeTruthy();
    expect(env.credentials.admin.password).toBeTruthy();
    expect(env.credentials.standard.username).toBeTruthy();

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

  test('Verify environment-specific feature flags and log levels', async ({ env }) => {
    expect(typeof env.featureFlags.experimentalUi).toBe('boolean');
    expect(['DEBUG', 'INFO', 'WARN', 'ERROR']).toContain(env.logLevel);
  });
});
