import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BelvoWidgetService } from './services/belvo-widget.service';
import { BelvoLinksService } from './services/belvo-links.service';
import { BelvoAccountsService } from './services/belvo-accounts.service';
import { BelvoTransactionsService } from './services/belvo-transactions.service';
import { CreateWidgetTokenDto } from './dto/create-widget-token.dto';
import { GetFinancialDataDto, SaveLinkDto } from './dto/get-financial-data.dto';

@Controller('belvo')
export class BelvoController {
  private readonly logger = new Logger(BelvoController.name);

  constructor(
    private readonly widgetService: BelvoWidgetService,
    private readonly linksService: BelvoLinksService,
    private readonly accountsService: BelvoAccountsService,
    private readonly transactionsService: BelvoTransactionsService,
  ) {}

  // ========== WIDGET ENDPOINTS ==========

  @Post('widget/token')
  @HttpCode(HttpStatus.OK)
  async createWidgetToken(@Body() dto: CreateWidgetTokenDto) {
    this.logger.log('Endpoint: POST /belvo/widget/token');
    return this.widgetService.createToken(dto);
  }

  // ========== LINKS ENDPOINTS ==========

  @Post('links/save')
  @HttpCode(HttpStatus.OK)
  async saveLink(@Body() dto: SaveLinkDto) {
    this.logger.log(`Endpoint: POST /belvo/links/save - LinkID: ${dto.link_id}`);
    const link = await this.linksService.getById(dto.link_id);
    return {
      success: true,
      message: 'Link saved successfully',
      data: link,
    };
  }

  @Get('links')
  async listLinks(
    @Query('page') page?: number,
    @Query('page_size') pageSize?: number,
    @Query('institution') institution?: string,
  ) {
    this.logger.log('Endpoint: GET /belvo/links');
    return this.linksService.list({
      page,
      page_size: pageSize,
      institution,
    });
  }

  @Get('links/:linkId')
  async getLink(@Param('linkId') linkId: string) {
    this.logger.log(`Endpoint: GET /belvo/links/${linkId}`);
    return this.linksService.getById(linkId);
  }

  @Delete('links/:linkId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLink(@Param('linkId') linkId: string) {
    this.logger.log(`Endpoint: DELETE /belvo/links/${linkId}`);
    await this.linksService.delete(linkId);
  }

  // ========== ACCOUNTS ENDPOINTS ==========

  @Post('accounts/retrieve')
  @HttpCode(HttpStatus.OK)
  async retrieveAccounts(@Body('link_id') linkId: string) {
    this.logger.log(`Endpoint: POST /belvo/accounts/retrieve - LinkID: ${linkId}`);
    return this.accountsService.retrieve(linkId);
  }

  @Get('accounts')
  async listAccounts(
    @Query('link') link?: string,
    @Query('page') page?: number,
    @Query('page_size') pageSize?: number,
  ) {
    this.logger.log('Endpoint: GET /belvo/accounts');
    return this.accountsService.list({ link, page, page_size: pageSize });
  }

  @Get('accounts/:accountId')
  async getAccount(@Param('accountId') accountId: string) {
    this.logger.log(`Endpoint: GET /belvo/accounts/${accountId}`);
    return this.accountsService.getById(accountId);
  }

  @Delete('accounts/:accountId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@Param('accountId') accountId: string) {
    this.logger.log(`Endpoint: DELETE /belvo/accounts/${accountId}`);
    await this.accountsService.delete(accountId);
  }

  // ========== BALANCES ENDPOINTS ==========

  @Post('balances/retrieve')
  @HttpCode(HttpStatus.OK)
  async retrieveBalances(@Body('link_id') linkId: string) {
    this.logger.log(`Endpoint: POST /belvo/balances/retrieve - LinkID: ${linkId}`);
    return this.accountsService.getBalances(linkId);
  }

  @Get('balances')
  async listBalances(
    @Query('link') link?: string,
    @Query('account') account?: string,
    @Query('page') page?: number,
    @Query('page_size') pageSize?: number,
  ) {
    this.logger.log('Endpoint: GET /belvo/balances');
    return this.accountsService.listBalances({
      link,
      account,
      page,
      page_size: pageSize,
    });
  }

  // ========== TRANSACTIONS ENDPOINTS ==========

  @Post('transactions/retrieve')
  @HttpCode(HttpStatus.OK)
  async retrieveTransactions(@Body() dto: GetFinancialDataDto) {
    this.logger.log(
      `Endpoint: POST /belvo/transactions/retrieve - LinkID: ${dto.link_id}`,
    );
    return this.transactionsService.retrieve(dto);
  }

  @Get('transactions')
  async listTransactions(
    @Query('link') link?: string,
    @Query('account') account?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('page') page?: number,
    @Query('page_size') pageSize?: number,
  ) {
    this.logger.log('Endpoint: GET /belvo/transactions');
    return this.transactionsService.list({
      link,
      account,
      date_from: dateFrom,
      date_to: dateTo,
      page,
      page_size: pageSize,
    });
  }

  @Get('transactions/:transactionId')
  async getTransaction(@Param('transactionId') transactionId: string) {
    this.logger.log(`Endpoint: GET /belvo/transactions/${transactionId}`);
    return this.transactionsService.getById(transactionId);
  }

  @Delete('transactions/:transactionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTransaction(@Param('transactionId') transactionId: string) {
    this.logger.log(`Endpoint: DELETE /belvo/transactions/${transactionId}`);
    await this.transactionsService.delete(transactionId);
  }

  // ========== SUMMARY ENDPOINT ==========

  @Get('summary/:linkId')
  async getFinancialSummary(@Param('linkId') linkId: string) {
    this.logger.log(`Endpoint: GET /belvo/summary/${linkId}`);

    const [link, accounts, transactions, balances] = await Promise.all([
      this.linksService.getById(linkId),
      this.accountsService.retrieve(linkId),
      this.transactionsService.retrieve({ link_id: linkId }),
      this.accountsService.getBalances(linkId),
    ]);

    return {
      link,
      accounts,
      transactions,
      balances,
      summary: {
        total_accounts: accounts.length,
        total_transactions: transactions.length,
        total_balance: accounts.reduce(
          (sum, acc) => sum + (acc.balance?.current || 0),
          0,
        ),
      },
    };
  }
}
