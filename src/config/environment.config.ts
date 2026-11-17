import { EnvironmentConfig, EnvironmentConfigData, StandardUserRole, UserProfile } from './envs/env.types';
import qaConfig from './envs/qa.config';
import devConfig from './envs/dev.config';
import stagingConfig from './envs/staging.config';
import prodConfig from './envs/prod.config';

export * from './envs/env.types';

// 1. Get environment name from CLI / env variable (default fallback to 'qa')
const environmentName = (process.env.ENV || process.env.configFile || 'qa').toLowerCase();

// 2. Select environment config file matching ${environmentName}.config.ts
const configRegistry: Record<string, EnvironmentConfigData> = {
  qa: qaConfig,
  dev: devConfig,
  staging: stagingConfig,
  prod: prodConfig,
};
const environmentConfig = configRegistry[environmentName] || qaConfig;

// 3. CLI override for Base URL (Dynamic / CI preview environments)
const cmdLineUrl = process.env.BASE_URL;
const cmdLineMessage = cmdLineUrl ? 'CI Environment is present' : 'CI Environment is not present';
const targetEnvironment = cmdLineUrl ? 'Featured (Dynamic) Environment' : environmentName;

// 4. Now the cmdLine will override value of config file for base url
const baseUrl = cmdLineUrl || environmentConfig.baseUrl;

// 5. Merged environment configuration
export const ENV_CONFIG: EnvironmentConfig = {
  ...environmentConfig,
  envName: environmentName,
  baseUrl,
  targetEnvironment,

  // Capability to resolve different URLs for different users / roles
  getUserUrl: (role: StandardUserRole | string, subpath = '') => {
    const cleanSubpath = subpath ? (subpath.startsWith('/') ? subpath : `/${subpath}`) : '';
    const root = environmentConfig.users?.[role]?.portalUrl || environmentConfig.userUrls?.[role] || baseUrl;
    return `${root.replace(/\/$/, '')}${cleanSubpath}`;
  },

  getUser: (role: StandardUserRole | string): UserProfile => {
    const user = environmentConfig.users?.[role];
    if (!user) {
      throw new Error(`User role "${role}" not found in ${environmentName}.config.ts`);
    }
    return user;
  },

  isDev: () => environmentName === 'dev',
  isQa: () => environmentName === 'qa',
  isStaging: () => environmentName === 'staging',
  isProd: () => environmentName === 'prod',
};

export default ENV_CONFIG;
