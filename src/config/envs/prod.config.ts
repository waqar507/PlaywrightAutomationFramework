import { EnvironmentConfigData } from './env.types';

export const prodConfig: EnvironmentConfigData = {
  envName: 'prod',
  baseUrl: 'https://prod.example.com',
  apiBaseUrl: 'https://api.example.com',
  defaultTimeout: 60000,
  expectTimeout: 15000,
  headless: true,
  logLevel: 'WARN',
  userUrls: {
    admin: 'https://admin.example.com',
    standard: 'https://portal.example.com',
    vendor: 'https://vendor.example.com',
    customer: 'https://app.example.com',
  },
  users: {
    admin: {
      username: 'prod_monitoring@example.com',
      password: 'ProdSuperSecurePassword999!',
      url: 'https://admin.example.com',
      description: 'Production synthetic monitoring admin',
    },
    standard: {
      username: 'prod_readonly@example.com',
      password: 'ProdReadonlyPass123!',
      url: 'https://portal.example.com',
      description: 'Production read-only synthetic user',
    },
    vendor: {
      username: 'prod_vendor_readonly@example.com',
      password: 'ProdVendorSecurePass123!',
      url: 'https://vendor.example.com',
      description: 'Production read-only vendor monitor',
    },
    customer: {
      username: 'prod_customer_sample@example.com',
      password: 'ProdCustomerSecurePass123!',
      url: 'https://app.example.com',
      description: 'Production customer sample user',
    },
  },
  featureFlags: {
    experimentalUi: false,
    newCheckoutFlow: true,
    mfaEnforced: true,
  },
};

export default prodConfig;
