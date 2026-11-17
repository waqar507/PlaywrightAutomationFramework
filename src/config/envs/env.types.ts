export type Environment = 'dev' | 'qa' | 'staging' | 'prod';

export type StandardUserRole = 'admin' | 'standard' | 'vendor' | 'customer';

export interface UserProfile {
  readonly username: string;
  readonly password: string;
  readonly url: string;
  readonly apiToken?: string;
  readonly description?: string;
}

export interface EnvironmentConfigData {
  readonly envName: Environment;
  readonly baseUrl: string;
  readonly apiBaseUrl: string;
  readonly defaultTimeout: number;
  readonly expectTimeout: number;
  readonly headless: boolean;
  readonly logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  readonly userUrls: Record<string, string>;
  readonly users: Record<string, UserProfile>;
  readonly featureFlags: Record<string, boolean>;
}

export interface EnvironmentConfig extends EnvironmentConfigData {
  getUserUrl(userRole: StandardUserRole | string, subpath?: string): string;
  getUser(userRole: StandardUserRole | string): UserProfile;
  isDev(): boolean;
  isQa(): boolean;
  isStaging(): boolean;
  isProd(): boolean;
}
