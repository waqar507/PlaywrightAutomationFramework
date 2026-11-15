export type Environment = 'dev' | 'qa' | 'staging' | 'prod';

export const DEFAULT_ENVIRONMENT: Environment = 'qa';

export interface EnvironmentData {
  readonly envName: Environment;
  readonly baseUrl: string;
  readonly apiBaseUrl: string;
  readonly defaultTimeout: number;
  readonly expectTimeout: number;
  readonly headless: boolean;
  readonly logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  readonly credentials: {
    readonly admin: {
      readonly username: string;
      readonly password: string;
    };
    readonly standard: {
      readonly username: string;
      readonly password: string;
    };
  };
  readonly featureFlags: {
    readonly experimentalUi: boolean;
  };
}

export interface EnvironmentConfig extends EnvironmentData {
  isDev(): boolean;
  isQa(): boolean;
  isStaging(): boolean;
  isProd(): boolean;
}

/**
 * Pure TypeScript Multi-Environment Preset Matrix
 * Eliminates external dependencies (dotenv) while providing full compile-time type safety.
 */
const ENVIRONMENTS: Record<Environment, EnvironmentData> = {
  dev: {
    envName: 'dev',
    baseUrl: 'https://dev.example.com',
    apiBaseUrl: 'https://api-dev.example.com',
    defaultTimeout: 30000,
    expectTimeout: 10000,
    headless: true,
    logLevel: 'DEBUG',
    credentials: {
      admin: {
        username: 'dev_admin@example.com',
        password: 'DevSecretPassword123!',
      },
      standard: {
        username: 'dev_user@example.com',
        password: 'DevUserPassword123!',
      },
    },
    featureFlags: {
      experimentalUi: true,
    },
  },
  qa: {
    envName: 'qa',
    baseUrl: 'https://qa.example.com',
    apiBaseUrl: 'https://api-qa.example.com',
    defaultTimeout: 30000,
    expectTimeout: 10000,
    headless: true,
    logLevel: 'INFO',
    credentials: {
      admin: {
        username: 'qa_admin@example.com',
        password: 'QaSecretPassword123!',
      },
      standard: {
        username: 'qa_user@example.com',
        password: 'QaUserPassword123!',
      },
    },
    featureFlags: {
      experimentalUi: false,
    },
  },
  staging: {
    envName: 'staging',
    baseUrl: 'https://staging.example.com',
    apiBaseUrl: 'https://api-staging.example.com',
    defaultTimeout: 45000,
    expectTimeout: 12000,
    headless: true,
    logLevel: 'INFO',
    credentials: {
      admin: {
        username: 'staging_admin@example.com',
        password: 'StagingSecretPassword123!',
      },
      standard: {
        username: 'staging_user@example.com',
        password: 'StagingUserPassword123!',
      },
    },
    featureFlags: {
      experimentalUi: false,
    },
  },
  prod: {
    envName: 'prod',
    baseUrl: 'https://prod.example.com',
    apiBaseUrl: 'https://api.example.com',
    defaultTimeout: 60000,
    expectTimeout: 15000,
    headless: true,
    logLevel: 'WARN',
    credentials: {
      admin: {
        username: 'prod_monitoring@example.com',
        password: 'ProdSuperSecurePassword999!',
      },
      standard: {
        username: 'prod_readonly@example.com',
        password: 'ProdReadonlyPass123!',
      },
    },
    featureFlags: {
      experimentalUi: false,
    },
  },
};

/**
 * Resolves active environment configuration.
 * Allows CLI / process.env overrides to take precedence over the environment preset.
 */
function loadEnvironmentConfig(): EnvironmentConfig {
  const targetEnv = (process.env.ENV || DEFAULT_ENVIRONMENT).toLowerCase() as Environment;
  const preset = ENVIRONMENTS[targetEnv] || ENVIRONMENTS[DEFAULT_ENVIRONMENT];

  // Allow optional process.env overrides (e.g. from CI/CD variables)
  const envName = (process.env.ENV_NAME || preset.envName) as Environment;
  const baseUrl = process.env.BASE_URL || preset.baseUrl;
  const apiBaseUrl = process.env.API_BASE_URL || preset.apiBaseUrl;
  const defaultTimeout = process.env.DEFAULT_TIMEOUT
    ? parseInt(process.env.DEFAULT_TIMEOUT, 10)
    : preset.defaultTimeout;
  const expectTimeout = process.env.EXPECT_TIMEOUT
    ? parseInt(process.env.EXPECT_TIMEOUT, 10)
    : preset.expectTimeout;
  const headless = process.env.HEADLESS !== undefined
    ? process.env.HEADLESS !== 'false'
    : preset.headless;
  const logLevel = (process.env.LOG_LEVEL || preset.logLevel).toUpperCase() as 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

  return {
    envName,
    baseUrl,
    apiBaseUrl,
    defaultTimeout,
    expectTimeout,
    headless,
    logLevel,
    credentials: {
      admin: {
        username: process.env.ADMIN_USERNAME || preset.credentials.admin.username,
        password: process.env.ADMIN_PASSWORD || preset.credentials.admin.password,
      },
      standard: {
        username: process.env.STANDARD_USERNAME || preset.credentials.standard.username,
        password: process.env.STANDARD_PASSWORD || preset.credentials.standard.password,
      },
    },
    featureFlags: {
      experimentalUi: process.env.FEATURE_EXPERIMENTAL_UI !== undefined
        ? process.env.FEATURE_EXPERIMENTAL_UI === 'true'
        : preset.featureFlags.experimentalUi,
    },
    isDev: () => envName === 'dev',
    isQa: () => envName === 'qa',
    isStaging: () => envName === 'staging',
    isProd: () => envName === 'prod',
  };
}

export const ENV_CONFIG: EnvironmentConfig = loadEnvironmentConfig();
