import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { BelvoWidgetService } from './services/belvo-widget.service';
import { BelvoLinksService } from './services/belvo-links.service';
import { BelvoAccountsService } from './services/belvo-accounts.service';
import { BelvoTransactionsService } from './services/belvo-transactions.service';
import { BelvoInvoicesService } from './services/belvo-invoices.service';
import { BelvoTaxReturnsService } from './services/belvo-tax-returns.service';
import { WidgetConfigBuilder } from './builders/widget-config.builder';
import { belvoConfig } from './config/belvo.config';

@Module({
  imports: [
    ConfigModule.forFeature(belvoConfig),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [],
  providers: [
    BelvoWidgetService,
    BelvoLinksService,
    BelvoAccountsService,
    BelvoTransactionsService,
    BelvoInvoicesService,
    BelvoTaxReturnsService,
    WidgetConfigBuilder,
  ],
  exports: [
    BelvoWidgetService,
    BelvoLinksService,
    BelvoAccountsService,
    BelvoTransactionsService,
    BelvoInvoicesService,
    BelvoTaxReturnsService,
    WidgetConfigBuilder,
  ],
})
export class BelvoModule {}
