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

@Public()
@Controller('customers/:customerId/financial')
export class CustomerFinancialController {
  constructor(
    private readonly customerFinancialService: CustomerFinancialService,
  ) {}

  @Post('widget-token')
  @HttpCode(HttpStatus.OK)
  async getWidgetToken(@Param('customerId') customerId: string) {
    return this.customerFinancialService.getWidgetAccessToken(customerId);
  }

  @Post('link')
  @HttpCode(HttpStatus.OK)
  async linkBankAccount(
    @Param('customerId') customerId: string,
    @Body('link_id') linkId: string,
  ) {
   
    return this.customerFinancialService.linkBankAccount(customerId, linkId);
  }

  @Delete('unlink')
  @HttpCode(HttpStatus.OK)
  async unlinkBankAccount(@Param('customerId') customerId: string) {
  
    return this.customerFinancialService.unlinkBankAccount(customerId);
  }

  @Get('status')
  async getBankLinkStatus(@Param('customerId') customerId: string) {
    return this.customerFinancialService.getBankLinkStatus(customerId);
  }

  @Get('accounts')
  async getAccounts(@Param('customerId') customerId: string) {
 
    return this.customerFinancialService.getAccounts(customerId);
  }

  @Get('transactions')
  async getTransactions(
    @Param('customerId') customerId: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ) {
  
    return this.customerFinancialService.getTransactions(
      customerId,
      dateFrom,
      dateTo,
    );
  }

  @Get('balances')
  async getBalances(@Param('customerId') customerId: string) {
    return this.customerFinancialService.getBalances(customerId);
  }

  @Get('summary')
  async getFinancialSummary(@Param('customerId') customerId: string) {
    return this.customerFinancialService.getFinancialSummary(customerId);
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async syncData(@Param('customerId') customerId: string) {
    return this.customerFinancialService.syncData(customerId);
  }
}
