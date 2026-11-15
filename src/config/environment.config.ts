import * as dotenv from 'dotenv';
import * as path from 'path';

export type Environment = 'dev' | 'qa' | 'staging' | 'prod';

export const DEFAULT_ENVIRONMENT: Environment = 'qa';

export interface EnvironmentConfig {
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
  isDev(): boolean;
  isQa(): boolean;
  isStaging(): boolean;
  isProd(): boolean;
}

/**
 * Enterprise Environment Loader
 * Resolves environment-specific configurations dynamically based on the ENV runtime variable.
 */
function loadEnvironmentConfig(): EnvironmentConfig {
  const targetEnv = (process.env.ENV || 'qa').toLowerCase() as Environment;
  const envFilePath = path.resolve(process.cwd(), `.env.${targetEnv}`);

  // Load target environment file, keeping existing process.env variables as overrides
  dotenv.config({ path: envFilePath });

  const envName = (process.env.ENV_NAME || targetEnv) as Environment;
  const baseUrl = process.env.BASE_URL || 'https://qa.example.com';
  const apiBaseUrl = process.env.API_BASE_URL || 'https://api-qa.example.com';
  const defaultTimeout = parseInt(process.env.DEFAULT_TIMEOUT || '30000', 10);
  const expectTimeout = parseInt(process.env.EXPECT_TIMEOUT || '10000', 10);
  const headless = process.env.HEADLESS !== 'false';
  const logLevel = (process.env.LOG_LEVEL || 'INFO').toUpperCase() as 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

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
        username: process.env.ADMIN_USERNAME || 'admin@example.com',
        password: process.env.ADMIN_PASSWORD || 'DefaultAdminPass123!',
      },
      standard: {
        username: process.env.STANDARD_USERNAME || 'user@example.com',
        password: process.env.STANDARD_PASSWORD || 'DefaultUserPass123!',
      },
    },
    featureFlags: {
      experimentalUi: process.env.FEATURE_EXPERIMENTAL_UI === 'true',
    },
    isDev: () => envName === 'dev',
    isQa: () => envName === 'qa',
    isStaging: () => envName === 'staging',
    isProd: () => envName === 'prod',
  };
}

export const ENV_CONFIG: EnvironmentConfig = loadEnvironmentConfig();
