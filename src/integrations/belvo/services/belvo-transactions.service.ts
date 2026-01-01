import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BelvoBaseService } from './belvo-base.service';
import { BelvoTransaction } from '../interfaces/belvo-link.interface';
import { GetFinancialDataDto } from '../dto/get-financial-data.dto';
import { BELVO_API_ENDPOINTS } from '../constants/belvo.constants';

@Injectable()
export class BelvoTransactionsService extends BelvoBaseService {
  constructor(http: HttpService, config: ConfigService) {
    super(http, config);
  }

  async retrieve(dto: GetFinancialDataDto): Promise<BelvoTransaction[]> {
    this.logger.log(`Retrieving transactions for link: ${dto.link_id}`);

    const payload: any = {
      link: dto.link_id,
    };

    if (dto.date_from) {
      payload.date_from = dto.date_from;
    }

    if (dto.date_to) {
      payload.date_to = dto.date_to;
    }

    const response = await this.request(
      'post',
      BELVO_API_ENDPOINTS.TRANSACTIONS,
      payload,
      {
        validate: (data) => !!data,
        invalidMsg: 'Invalid transactions response',
      },
    );

    return this.extractResults<BelvoTransaction>(response);
  }

  async list(params?: {
    link?: string;
    account?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    page_size?: number;
  }): Promise<BelvoTransaction[]> {
    this.logger.log('Listing transactions...');

    const response = await this.request(
      'get',
      BELVO_API_ENDPOINTS.TRANSACTIONS,
      undefined,
      {
        params,
        validate: (data) => !!data,
        invalidMsg: 'Invalid transactions list response',
      },
    );

    return this.extractResults<BelvoTransaction>(response);
  }

  async getById(transactionId: string): Promise<BelvoTransaction> {
    this.logger.log(`Fetching transaction: ${transactionId}`);

    return this.request<BelvoTransaction>(
      'get',
      `${BELVO_API_ENDPOINTS.TRANSACTIONS}${transactionId}/`,
      undefined,
      {
        validate: (data: BelvoTransaction) => !!data?.id,
        invalidMsg: `Transaction ${transactionId} not found`,
      },
    );
  }

  async delete(transactionId: string): Promise<void> {
    this.logger.log(`Deleting transaction: ${transactionId}`);

    await this.request(
      'delete',
      `${BELVO_API_ENDPOINTS.TRANSACTIONS}${transactionId}/`,
    );

    this.logger.log(`Transaction ${transactionId} deleted successfully`);
  }

  async getByAccount(
    accountId: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<BelvoTransaction[]> {
    this.logger.log(`Fetching transactions for account: ${accountId}`);

    const params: any = { account: accountId };

    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;

    return this.list(params);
  }
}
