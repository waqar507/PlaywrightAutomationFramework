import { EnvironmentConfigData } from './env.types';

export const qaConfig: EnvironmentConfigData = {
  envName: 'qa',
  baseUrl: 'https://qa.example.com',
  apiBaseUrl: 'https://api-qa.example.com',
  defaultTimeout: 30000,
  expectTimeout: 10000,
  headless: true,
  logLevel: 'INFO',
  userUrls: {
    admin: 'https://admin-qa.example.com',
    standard: 'https://portal-qa.example.com',
    vendor: 'https://vendor-qa.example.com',
    customer: 'https://app-qa.example.com',
  },
  users: {
    admin: {
      username: 'qa_admin@example.com',
      password: 'QaAdminPassword123!',
      url: 'https://admin-qa.example.com',
      description: 'System Administrator with full access to QA portal',
    },
    standard: {
      username: 'qa_user@example.com',
      password: 'QaUserPassword123!',
      url: 'https://portal-qa.example.com',
      description: 'Standard enterprise employee user in QA',
    },
    vendor: {
      username: 'qa_vendor@example.com',
      password: 'QaVendorPassword123!',
      url: 'https://vendor-qa.example.com',
      description: 'Third-party vendor account with restricted QA privileges',
    },
    customer: {
      username: 'qa_customer@example.com',
      password: 'QaCustomerPassword123!',
      url: 'https://app-qa.example.com',
      description: 'Consumer / End-customer role in QA',
    },
  },
  featureFlags: {
    experimentalUi: false,
    newCheckoutFlow: true,
    mfaEnforced: false,
  },
};

export default qaConfig;
