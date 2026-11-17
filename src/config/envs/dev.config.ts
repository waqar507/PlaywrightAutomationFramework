import { EnvironmentConfigData } from './env.types';

export const devConfig: EnvironmentConfigData = {
  envName: 'dev',
  baseUrl: 'https://dev.example.com',
  apiBaseUrl: 'https://api-dev.example.com',
  defaultTimeout: 30000,
  expectTimeout: 10000,
  headless: true,
  logLevel: 'DEBUG',
  userUrls: {
    admin: 'https://admin-dev.example.com',
    standard: 'https://portal-dev.example.com',
    vendor: 'https://vendor-dev.example.com',
    customer: 'https://app-dev.example.com',
  },
  users: {
    admin: {
      username: 'dev_admin@example.com',
      password: 'DevSecretPassword123!',
      url: 'https://admin-dev.example.com',
      description: 'Dev environment admin',
    },
    standard: {
      username: 'dev_user@example.com',
      password: 'DevUserPassword123!',
      url: 'https://portal-dev.example.com',
      description: 'Dev environment standard user',
    },
    vendor: {
      username: 'dev_vendor@example.com',
      password: 'DevVendorPassword123!',
      url: 'https://vendor-dev.example.com',
      description: 'Dev environment vendor user',
    },
    customer: {
      username: 'dev_customer@example.com',
      password: 'DevCustomerPassword123!',
      url: 'https://app-dev.example.com',
      description: 'Dev environment customer user',
    },
  },
  featureFlags: {
    experimentalUi: true,
    newCheckoutFlow: true,
    mfaEnforced: false,
  },
};

export default devConfig;
