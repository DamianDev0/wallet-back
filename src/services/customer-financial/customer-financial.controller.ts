import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CustomerFinancialService } from './services/customer-financial.service';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/user.decorator';
import { AuthUser } from '@common/interfaces/auth-user.interface';

@Controller()
export class CustomerFinancialController {
  constructor(
    private readonly customerFinancialService: CustomerFinancialService,
  ) {}

  @Public()
  @Post('customers/:customerId/financial/widget-token')
  @HttpCode(HttpStatus.OK)
  async getWidgetToken(@Param('customerId') customerId: string) {
    return this.customerFinancialService.getWidgetAccessToken(customerId);
  }

  @Public()
  @Post('customers/:customerId/financial/link')
  @HttpCode(HttpStatus.OK)
  async linkBankAccount(
    @Param('customerId') customerId: string,
    @Body('link_id') linkId: string,
  ) {
    return this.customerFinancialService.linkBankAccount(customerId, linkId);
  }

  @Delete('financial/unlink')
  @HttpCode(HttpStatus.OK)
  async unlinkBankAccount(@CurrentUser() user: AuthUser) {
    return this.customerFinancialService.unlinkBankAccount(user.sub);
  }

  @Get('financial/status')
  async getBankLinkStatus(@CurrentUser() user: AuthUser) {
    return this.customerFinancialService.getBankLinkStatus(user.sub);
  }

  @Get('financial/accounts')
  async getAccounts(@CurrentUser() user: AuthUser) {
    return this.customerFinancialService.getAccounts(user.sub);
  }

  @Get('financial/transactions')
  async getTransactions(
    @CurrentUser() user: AuthUser,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ) {
    return this.customerFinancialService.getTransactions(
      user.sub,
      dateFrom,
      dateTo,
    );
  }

  @Get('financial/balances')
  async getBalances(@CurrentUser() user: AuthUser) {
    return this.customerFinancialService.getBalances(user.sub);
  }

  @Get('financial/summary')
  async getFinancialSummary(@CurrentUser() user: AuthUser) {
    return this.customerFinancialService.getFinancialSummary(user.sub);
  }

  @Post('financial/sync')
  @HttpCode(HttpStatus.OK)
  async syncData(@CurrentUser() user: AuthUser) {
    return this.customerFinancialService.syncData(user.sub);
  }

  @Post('financial/fiscal/sync')
  @HttpCode(HttpStatus.OK)
  async syncFiscalData(@CurrentUser() user: AuthUser) {
    return this.customerFinancialService.syncFiscalData(user.sub);
  }

  @Get('financial/fiscal/invoices')
  async getInvoices(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ) {
    return this.customerFinancialService.getInvoices(
      user.sub,
      page,
      limit,
      dateFrom,
      dateTo,
    );
  }

  @Get('financial/fiscal/invoices/:invoiceId')
  async getInvoiceById(
    @CurrentUser() user: AuthUser,
    @Param('invoiceId') invoiceId: string,
  ) {
    return this.customerFinancialService.getInvoiceById(user.sub, invoiceId);
  }

  @Get('financial/fiscal/tax-returns')
  async getTaxReturns(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.customerFinancialService.getTaxReturns(user.sub, page, limit);
  }

  @Get('financial/fiscal/tax-returns/:taxReturnId')
  async getTaxReturnById(
    @CurrentUser() user: AuthUser,
    @Param('taxReturnId') taxReturnId: string,
  ) {
    return this.customerFinancialService.getTaxReturnById(user.sub, taxReturnId);
  }

  @Get('financial/fiscal/sync-status')
  async getFiscalSyncStatus(@CurrentUser() user: AuthUser) {
    return this.customerFinancialService.getFiscalSyncStatus(user.sub);
  }
}
