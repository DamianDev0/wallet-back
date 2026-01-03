import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BelvoBaseService } from './belvo-base.service';
import {
  BelvoInvoice,
  BelvoInvoicesListResponse,
  BelvoInvoicesRetrieveRequest,
} from '../interfaces/belvo-invoice.interface';

@Injectable()
export class BelvoInvoicesService extends BelvoBaseService {
  constructor(http: HttpService, config: ConfigService) {
    super(http, config);
  }

  async retrieve(params: BelvoInvoicesRetrieveRequest): Promise<BelvoInvoice[]> {
    this.logger.log(`Retrieving invoices for link: ${params.link}`);

    const response = await this.request<BelvoInvoice[]>(
      'post',
      '/api/invoices/',
      params,
      {
        validate: (data) => Array.isArray(data),
        invalidMsg: 'Invalid invoices response',
      },
    );

    this.logger.log(`Retrieved ${response.length} invoices`);
    return response;
  }

  async list(params?: {
    link?: string;
    page?: number;
    page_size?: number;
  }): Promise<BelvoInvoicesListResponse> {
    this.logger.log('Listing invoices');

    return this.request<BelvoInvoicesListResponse>('get', '/api/invoices/', null, {
      validate: (data) => Boolean(data?.results),
      invalidMsg: 'Invalid invoices list response',
      params,
    });
  }

  async getById(id: string): Promise<BelvoInvoice> {
    this.logger.log(`Getting invoice by ID: ${id}`);

    return this.request<BelvoInvoice>('get', `/api/invoices/${id}/`, null, {
      validate: (data) => Boolean(data?.id),
      invalidMsg: 'Invalid invoice response',
    });
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting invoice: ${id}`);

    await this.request('delete', `/api/invoices/${id}/`, null, {
      validate: () => true,
      invalidMsg: 'Failed to delete invoice',
    });

    this.logger.log(`Invoice deleted: ${id}`);
  }
}
