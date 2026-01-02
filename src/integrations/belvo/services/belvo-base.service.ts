import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

export interface BelvoRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  responseType?: 'json' | 'arraybuffer' | 'stream';
  disableDefaultHeaders?: boolean;
  validate?: (data: any) => boolean;
  invalidMsg?: string;
}

export abstract class BelvoBaseService {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly http: HttpService,
    protected readonly config: ConfigService,
  ) {}

  protected getAuthHeader(): string {
    const secretId = this.config.get<string>('belvo.secretId');
    const secretPassword = this.config.get<string>('belvo.secretPassword');
    const basicAuth = Buffer.from(`${secretId}:${secretPassword}`).toString(
      'base64',
    );
    return `Basic ${basicAuth}`;
  }

  protected getDefaultHeaders(): Record<string, string> {
    return {
      Authorization: this.getAuthHeader(),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  protected getApiUrl(): string {
    return (
      this.config.get<string>('belvo.apiUrl') || 'https://api.belvo.com'
    );
  }

  protected async request<T = any>(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    endpoint: string,
    data?: any,
    options?: BelvoRequestOptions,
  ): Promise<T> {
    const {
      headers = {},
      params,
      responseType = 'json',
      disableDefaultHeaders = false,
      validate,
      invalidMsg = 'Invalid response from Belvo',
    } = options ?? {};

    const mergedHeaders = disableDefaultHeaders
      ? headers
      : { ...this.getDefaultHeaders(), ...headers };

    const url = `${this.getApiUrl()}${endpoint}`;

    try {
      this.logger.log(
        `🔵 BELVO REQUEST: [${method.toUpperCase()}] ${url}`,
      );
      this.logger.log(`🔵 HEADERS:`, JSON.stringify(mergedHeaders, null, 2));
      this.logger.log(`🔵 PAYLOAD:`, JSON.stringify(data, null, 2));

      const response$ = this.http.request<T>({
        method,
        url,
        data,
        params,
        headers: mergedHeaders,
        responseType,
      });

      const response = await firstValueFrom(response$);

      if (validate && !validate(response.data)) {
        throw new HttpException(invalidMsg, HttpStatus.BAD_GATEWAY);
      }

      this.logger.log(
        `${method.toUpperCase()} ${endpoint} -> ${response.status}`,
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, `${method.toUpperCase()} ${endpoint}`);
    }
  }

  protected handleError(error: AxiosError, context: string): never {
    const errResponse = error?.response?.data || error;

    this.logger.error(
      `Error in ${context}:`,
      JSON.stringify(errResponse),
    );

    const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = errResponse || 'Belvo API request failed';

    throw new HttpException(
      {
        statusCode: status,
        message: `Belvo API Error: ${JSON.stringify(message)}`,
        context,
      },
      status,
    );
  }

  protected extractResults<T>(data: any): T[] {
    return data?.results || data || [];
  }
}
