import { EnvironmentConfigData } from './env.types';

export const stagingConfig: EnvironmentConfigData = {
  envName: 'staging',
  baseUrl: 'https://staging.example.com',
  apiBaseUrl: 'https://api-staging.example.com',
  defaultTimeout: 45000,
  expectTimeout: 12000,
  headless: true,
  logLevel: 'INFO',
  userUrls: {
    admin: 'https://admin-staging.example.com',
    standard: 'https://portal-staging.example.com',
    vendor: 'https://vendor-staging.example.com',
    customer: 'https://app-staging.example.com',
  },
  users: {
    admin: {
      username: 'staging_admin@example.com',
      password: 'StagingSecretPassword123!',
      url: 'https://admin-staging.example.com',
      description: 'Staging environment admin user',
    },
    standard: {
      username: 'staging_user@example.com',
      password: 'StagingUserPassword123!',
      url: 'https://portal-staging.example.com',
      description: 'Staging environment standard employee',
    },
    vendor: {
      username: 'staging_vendor@example.com',
      password: 'StagingVendorPassword123!',
      url: 'https://vendor-staging.example.com',
      description: 'Staging environment vendor portal user',
    },
    customer: {
      username: 'staging_customer@example.com',
      password: 'StagingCustomerPassword123!',
      url: 'https://app-staging.example.com',
      description: 'Staging environment customer user',
    },
  },
  featureFlags: {
    experimentalUi: false,
    newCheckoutFlow: true,
    mfaEnforced: true,
  },
};

export default stagingConfig;
