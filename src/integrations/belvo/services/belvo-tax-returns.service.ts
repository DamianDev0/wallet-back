import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BelvoBaseService } from './belvo-base.service';
import {
  BelvoTaxReturn,
  BelvoTaxReturnsListResponse,
  BelvoTaxReturnsRetrieveRequest,
} from '../interfaces/belvo-tax-return.interface';

@Injectable()
export class BelvoTaxReturnsService extends BelvoBaseService {
  constructor(http: HttpService, config: ConfigService) {
    super(http, config);
  }

  async retrieve(params: BelvoTaxReturnsRetrieveRequest): Promise<BelvoTaxReturn[]> {
    this.logger.log(`Retrieving tax returns for link: ${params.link}`);

    const response = await this.request<BelvoTaxReturn[]>(
      'post',
      '/api/tax-returns/',
      params,
      {
        validate: (data) => Array.isArray(data),
        invalidMsg: 'Invalid tax returns response',
      },
    );

    this.logger.log(`Retrieved ${response.length} tax returns`);
    return response;
  }

  async list(params?: {
    link?: string;
    page?: number;
    page_size?: number;
  }): Promise<BelvoTaxReturnsListResponse> {
    this.logger.log('Listing tax returns');

    return this.request<BelvoTaxReturnsListResponse>('get', '/api/tax-returns/', null, {
      validate: (data) => Boolean(data?.results),
      invalidMsg: 'Invalid tax returns list response',
      params,
    });
  }

  async getById(id: string): Promise<BelvoTaxReturn> {
    this.logger.log(`Getting tax return by ID: ${id}`);

    return this.request<BelvoTaxReturn>('get', `/api/tax-returns/${id}/`, null, {
      validate: (data) => Boolean(data?.id),
      invalidMsg: 'Invalid tax return response',
    });
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting tax return: ${id}`);

    await this.request('delete', `/api/tax-returns/${id}/`, null, {
      validate: () => true,
      invalidMsg: 'Failed to delete tax return',
    });

    this.logger.log(`Tax return deleted: ${id}`);
  }
}
