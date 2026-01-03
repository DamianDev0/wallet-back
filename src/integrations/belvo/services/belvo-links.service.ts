import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BelvoBaseService } from './belvo-base.service';
import { BelvoLink } from '../interfaces/belvo-link.interface';
import { BELVO_API_ENDPOINTS } from '../constants/belvo.constants';

@Injectable()
export class BelvoLinksService extends BelvoBaseService {
  constructor(http: HttpService, config: ConfigService) {
    super(http, config);
  }

  async getById(linkId: string): Promise<BelvoLink> {
    this.logger.log(`Fetching link: ${linkId}`);

    return this.request<BelvoLink>(
      'get',
      `${BELVO_API_ENDPOINTS.LINKS}${linkId}/`,
      undefined,
      {
        validate: (data: BelvoLink) => !!data?.id,
        invalidMsg: `Link ${linkId} not found`,
      },
    );
  }

  async list(params?: {
    page?: number;
    page_size?: number;
    institution?: string;
    external_id?: string;
  }): Promise<{ count: number; results: BelvoLink[] }> {
    this.logger.log('Listing links...');

    return this.request(
      'get',
      BELVO_API_ENDPOINTS.LINKS,
      undefined,
      {
        params,
        validate: (data) => Array.isArray(data?.results) || Array.isArray(data),
        invalidMsg: 'Invalid links list response',
      },
    );
  }

  async getByExternalId(externalId: string): Promise<BelvoLink | null> {
    this.logger.log(`Fetching link by external_id: ${externalId}`);

    const response = await this.list({
      external_id: externalId,
      page_size: 1,
    });

    if (response.results && response.results.length > 0) {
      return response.results[0];
    }

    return null;
  }

  async delete(linkId: string): Promise<void> {
    this.logger.log(`Deleting link: ${linkId}`);

    await this.request(
      'delete',
      `${BELVO_API_ENDPOINTS.LINKS}${linkId}/`,
    );

    this.logger.log(`Link ${linkId} deleted successfully`);
  }

  async update(linkId: string, data: { password?: string; password2?: string; token?: string }): Promise<BelvoLink> {
    this.logger.log(`Updating link: ${linkId}`);

    return this.request<BelvoLink>(
      'patch',
      `${BELVO_API_ENDPOINTS.LINKS}${linkId}/`,
      data,
      {
        validate: (response: BelvoLink) => !!response?.id,
        invalidMsg: `Failed to update link ${linkId}`,
      },
    );
  }

  async register(
    institution: string,
    username: string,
    password: string,
    externalId?: string,
  ): Promise<BelvoLink> {
    this.logger.log(`Registering new link for institution: ${institution}`);

    const payload: any = {
      institution,
      username,
      password,
    };

    if (externalId) {
      payload.external_id = externalId;
    }

    return this.request<BelvoLink>(
      'post',
      BELVO_API_ENDPOINTS.LINKS,
      payload,
      {
        validate: (data: BelvoLink) => !!data?.id,
        invalidMsg: 'Failed to register link',
      },
    );
  }
}
