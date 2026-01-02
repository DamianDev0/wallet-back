import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BelvoBaseService } from './belvo-base.service';
import { WidgetTokenResponse } from '../interfaces/belvo-widget.interface';

@Injectable()
export class BelvoWidgetService extends BelvoBaseService {
  constructor(
    http: HttpService,
    config: ConfigService,
  ) {
    super(http, config);
  }

  async createAccessToken(): Promise<WidgetTokenResponse> {
    this.logger.log('Creating Belvo Widget access token');

    const secretId = this.config.get<string>('belvo.secretId');
    const secretPassword = this.config.get<string>('belvo.secretPassword');

    if (!secretId || !secretPassword) {
      throw new Error('Belvo credentials are missing');
    }

    const payload = {
      id: secretId,
      password: secretPassword,
    };

    const response = await this.request<WidgetTokenResponse>(
      'post',
      '/api/token/',
      payload,
      {
        validate: (data: WidgetTokenResponse) => Boolean(data?.access),
        invalidMsg: 'Invalid widget access token response',
        disableDefaultHeaders: true,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    this.logger.log('Widget access token created successfully');
    return response;
  }

  async refreshToken(refreshToken: string): Promise<WidgetTokenResponse> {
    this.logger.log('Refreshing widget token');

    return this.request<WidgetTokenResponse>(
      'post',
      '/api/token/',
      { refresh: refreshToken },
      {
        validate: (data: WidgetTokenResponse) => Boolean(data?.access),
        invalidMsg: 'Invalid refresh token response',
      },
    );
  }
}
