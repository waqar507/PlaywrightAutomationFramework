import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { Logger } from '@utils/logger';
import { ENV_CONFIG } from '@config/environment.config';

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  timeout?: number;
  authToken?: string;
  failOnStatusCode?: boolean;
}

export interface ApiResponse<T = any> {
  readonly status: number;
  readonly statusText: string;
  readonly ok: boolean;
  readonly headers: Record<string, string>;
  readonly data: T;
  readonly durationMs: number;
  readonly url: string;
  expectStatus(expectedStatus: number): void;
  expectSuccess(): void;
}

/**
 * Enterprise REST API Client Utility
 * Wraps Playwright's native APIRequestContext with structured logging,
 * automatic metrics, response encapsulation, and reporting integration.
 */
export class ApiClient {
  private requestContext: APIRequestContext;
  private baseUrl: string;
  private logger: Logger;
  private defaultHeaders: Record<string, string>;

  constructor(requestContext: APIRequestContext, baseUrl?: string, logger?: Logger) {
    this.requestContext = requestContext;
    this.baseUrl = (baseUrl || ENV_CONFIG.apiBaseUrl).replace(/\/$/, '');
    this.logger = logger || new Logger('ApiClient');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  /**
   * Sets a Bearer token or authorization header for subsequent API calls.
   */
  public setAuthToken(token: string, scheme = 'Bearer'): this {
    this.defaultHeaders['Authorization'] = `${scheme} ${token}`.trim();
    this.logger.debug(`Configured API Authorization scheme: "${scheme}"`);
    return this;
  }

  /**
   * Adds or updates a default header for all subsequent requests.
   */
  public setDefaultHeader(key: string, value: string): this {
    this.defaultHeaders[key] = value;
    return this;
  }

  /**
   * Removes a default header.
   */
  public removeDefaultHeader(key: string): this {
    delete this.defaultHeaders[key];
    return this;
  }

  /**
   * Resolves the full request URL from a relative path or absolute URL.
   */
  private resolveUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${cleanEndpoint}`;
  }

  /**
   * Internal request executor handling metrics, payload attachments, and response encapsulation.
   */
  private async executeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD',
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    const fullUrl = this.resolveUrl(endpoint);
    const headers = { ...this.defaultHeaders, ...(options?.headers || {}) };

    if (options?.authToken) {
      headers['Authorization'] = `Bearer ${options.authToken}`;
    }

    this.logger.info(`[API Request] ${method} ${fullUrl}`);
    if (options?.params) {
      this.logger.debug(`[API Params] ${JSON.stringify(options.params)}`);
    }
    if (options?.data) {
      this.logger.debug(`[API Body] ${JSON.stringify(options.data)}`);
    }

    const startTime = Date.now();
    let rawResponse: APIResponse;

    try {
      rawResponse = await this.requestContext.fetch(fullUrl, {
        method,
        headers,
        params: options?.params,
        data: options?.data,
        timeout: options?.timeout ?? ENV_CONFIG.defaultTimeout,
        failOnStatusCode: options?.failOnStatusCode ?? false,
      });
    } catch (error) {
      this.logger.error(`[API Network Error] ${method} ${fullUrl} failed`, error);
      throw error;
    }

    const durationMs = Date.now() - startTime;
    const status = rawResponse.status();
    const statusText = rawResponse.statusText();
    const responseHeaders = rawResponse.headers();

    let parsedData: any = null;
    const contentType = responseHeaders['content-type'] || '';

    try {
      if (contentType.includes('application/json')) {
        parsedData = await rawResponse.json();
      } else {
        parsedData = await rawResponse.text();
      }
    } catch {
      parsedData = await rawResponse.text();
    }

    this.logger.info(`[API Response] ${method} ${fullUrl} -> ${status} ${statusText} (${durationMs}ms)`);

    // Attach request/response to Playwright HTML report
    this.logger.attach(
      `API: ${method} ${endpoint}`,
      JSON.stringify(
        {
          request: {
            method,
            url: fullUrl,
            headers,
            params: options?.params,
            data: options?.data,
          },
          response: {
            status,
            statusText,
            durationMs,
            data: parsedData,
          },
        },
        null,
        2
      ),
      'application/json'
    );

    const apiResponse: ApiResponse<T> = {
      status,
      statusText,
      ok: rawResponse.ok(),
      headers: responseHeaders,
      data: parsedData as T,
      durationMs,
      url: fullUrl,
      expectStatus(expectedStatus: number) {
        expect(
          status,
          `Expected status ${expectedStatus} for ${method} ${fullUrl}, but received ${status}. Response: ${JSON.stringify(parsedData)}`
        ).toBe(expectedStatus);
      },
      expectSuccess() {
        expect(
          rawResponse.ok(),
          `Expected successful response (2xx) for ${method} ${fullUrl}, but received ${status}. Response: ${JSON.stringify(parsedData)}`
        ).toBe(true);
      },
    };

    return apiResponse;
  }

  // ==========================================
  // HTTP REST CONVENIENCE METHODS
  // ==========================================

  public async get<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.executeRequest<T>('GET', endpoint, options);
  }

  public async post<T = any>(endpoint: string, data?: unknown, options?: Omit<ApiRequestOptions, 'data'>): Promise<ApiResponse<T>> {
    return this.executeRequest<T>('POST', endpoint, { ...options, data });
  }

  public async put<T = any>(endpoint: string, data?: unknown, options?: Omit<ApiRequestOptions, 'data'>): Promise<ApiResponse<T>> {
    return this.executeRequest<T>('PUT', endpoint, { ...options, data });
  }

  public async patch<T = any>(endpoint: string, data?: unknown, options?: Omit<ApiRequestOptions, 'data'>): Promise<ApiResponse<T>> {
    return this.executeRequest<T>('PATCH', endpoint, { ...options, data });
  }

  public async delete<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.executeRequest<T>('DELETE', endpoint, options);
  }
}
