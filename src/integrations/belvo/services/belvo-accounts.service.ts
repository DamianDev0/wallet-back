import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BelvoBaseService } from './belvo-base.service';
import { BelvoAccount, BelvoBalance } from '../interfaces/belvo-link.interface';
import { BELVO_API_ENDPOINTS } from '../constants/belvo.constants';

@Injectable()
export class BelvoAccountsService extends BelvoBaseService {
  constructor(http: HttpService, config: ConfigService) {
    super(http, config);
  }

  async retrieve(linkId: string): Promise<BelvoAccount[]> {
    this.logger.log(`Retrieving accounts for link: ${linkId}`);

    const response = await this.request(
      'post',
      BELVO_API_ENDPOINTS.ACCOUNTS,
      { link: linkId },
      {
        validate: (data) => !!data,
        invalidMsg: 'Invalid accounts response',
      },
    );

    return this.extractResults<BelvoAccount>(response);
  }

  async list(params?: {
    link?: string;
    page?: number;
    page_size?: number;
  }): Promise<BelvoAccount[]> {
    this.logger.log('Listing accounts...');

    const response = await this.request(
      'get',
      BELVO_API_ENDPOINTS.ACCOUNTS,
      undefined,
      {
        params,
        validate: (data) => !!data,
        invalidMsg: 'Invalid accounts list response',
      },
    );

    return this.extractResults<BelvoAccount>(response);
  }

  async getById(accountId: string): Promise<BelvoAccount> {
    this.logger.log(`Fetching account: ${accountId}`);

    return this.request<BelvoAccount>(
      'get',
      `${BELVO_API_ENDPOINTS.ACCOUNTS}${accountId}/`,
      undefined,
      {
        validate: (data: BelvoAccount) => !!data?.id,
        invalidMsg: `Account ${accountId} not found`,
      },
    );
  }

  async delete(accountId: string): Promise<void> {
    this.logger.log(`Deleting account: ${accountId}`);

    await this.request(
      'delete',
      `${BELVO_API_ENDPOINTS.ACCOUNTS}${accountId}/`,
    );

    this.logger.log(`Account ${accountId} deleted successfully`);
  }

  async getBalances(linkId: string): Promise<BelvoBalance[]> {
    this.logger.log(`Retrieving balances for link: ${linkId}`);

    const response = await this.request(
      'post',
      BELVO_API_ENDPOINTS.BALANCES,
      { link: linkId },
      {
        validate: (data) => !!data,
        invalidMsg: 'Invalid balances response',
      },
    );

    return this.extractResults<BelvoBalance>(response);
  }

  async listBalances(params?: {
    link?: string;
    account?: string;
    page?: number;
    page_size?: number;
  }): Promise<BelvoBalance[]> {
    this.logger.log('Listing balances...');

    const response = await this.request(
      'get',
      BELVO_API_ENDPOINTS.BALANCES,
      undefined,
      {
        params,
        validate: (data) => !!data,
        invalidMsg: 'Invalid balances list response',
      },
    );

    return this.extractResults<BelvoBalance>(response);
  }
}
