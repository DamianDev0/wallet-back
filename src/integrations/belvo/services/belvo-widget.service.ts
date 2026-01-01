import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BelvoBaseService } from './belvo-base.service';
import { WidgetTokenResponse } from '../interfaces/belvo-widget.interface';
import { CreateWidgetTokenDto } from '../dto/create-widget-token.dto';
import { BELVO_API_ENDPOINTS } from '../constants/belvo.constants';

@Injectable()
export class BelvoWidgetService extends BelvoBaseService {
  constructor(http: HttpService, config: ConfigService) {
    super(http, config);
  }

  async createToken(
    dto: CreateWidgetTokenDto = {},
  ): Promise<WidgetTokenResponse> {
    this.logger.log('Creating widget access token...');

    const payload = {
      access_mode: dto.access_mode || 'single',
      external_id: dto.external_id,
      callback_url: dto.callback_url,
      widget: {
        branding: {
          company_name: 'Wallet App',
        },
      },
    };

    const response = await this.request<WidgetTokenResponse>(
      'post',
      BELVO_API_ENDPOINTS.TOKEN,
      payload,
      {
        validate: (data: WidgetTokenResponse) => !!data?.access,
        invalidMsg: 'Invalid widget token response',
      },
    );

    this.logger.log('Widget token created successfully');
    return response;
  }

  async refreshToken(refreshToken: string): Promise<WidgetTokenResponse> {
    this.logger.log('Refreshing widget token...');

    return this.request<WidgetTokenResponse>(
      'post',
      BELVO_API_ENDPOINTS.TOKEN,
      { refresh: refreshToken },
      {
        validate: (data: WidgetTokenResponse) => !!data?.access,
        invalidMsg: 'Invalid refresh token response',
      },
    );
  }
}
