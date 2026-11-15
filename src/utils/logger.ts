import { test, TestInfo } from '@playwright/test';
import { ENV_CONFIG } from '@config/environment.config';

export type LogLevel = 'DEBUG' | 'INFO' | 'STEP' | 'WARN' | 'ERROR';

const LOG_PRIORITY: Record<LogLevel, number> = {
  DEBUG: 10,
  INFO: 20,
  STEP: 25,
  WARN: 30,
  ERROR: 40,
};

export class Logger {
  private contextName: string;
  private currentTestInfo: TestInfo | null = null;

  constructor(contextName = 'Framework') {
    this.contextName = contextName;
  }

  public setTestInfo(testInfo: TestInfo): void {
    this.currentTestInfo = testInfo;
  }

  private shouldLog(level: LogLevel): boolean {
    const configuredLevel = (ENV_CONFIG.logLevel || 'INFO') as LogLevel;
    const minPriority = LOG_PRIORITY[configuredLevel] ?? 20;
    return LOG_PRIORITY[level] >= minPriority;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${this.contextName}] ${message}`;
  }

  public debug(message: string): void {
    if (this.shouldLog('DEBUG')) {
      console.debug(this.formatMessage('DEBUG', message));
    }
  }

  public info(message: string): void {
    if (this.shouldLog('INFO')) {
      console.log(this.formatMessage('INFO', message));
    }
  }

  public warn(message: string): void {
    if (this.shouldLog('WARN')) {
      console.warn(this.formatMessage('WARN', message));
    }
  }

  public error(message: string, error?: unknown): void {
    if (this.shouldLog('ERROR')) {
      const errStr = error instanceof Error ? `\nStack: ${error.stack}` : (error ? ` | Details: ${JSON.stringify(error)}` : '');
      console.error(this.formatMessage('ERROR', `${message}${errStr}`));
    }
  }

  /**
   * Logs a high-level test step and attaches it to the Playwright report.
   */
  public async step<T>(stepTitle: string, action: () => Promise<T>): Promise<T> {
    const formatted = this.formatMessage('STEP', stepTitle);
    console.log(formatted);
    return await test.step(stepTitle, action);
  }

  /**
   * Attaches text data or artifacts to the current test info.
   */
  public attach(name: string, content: string | Buffer, contentType = 'text/plain'): void {
    try {
      const activeTestInfo = this.currentTestInfo || test.info();
      if (activeTestInfo) {
        activeTestInfo.attach(name, {
          body: content,
          contentType,
        });
      }
    } catch {
      // Outside active test context; ignore attachment
    }
  }
}

export const logger = new Logger('Global');
