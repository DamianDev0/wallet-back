import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { BelvoWidgetService } from './services/belvo-widget.service';
import { BelvoLinksService } from './services/belvo-links.service';
import { BelvoAccountsService } from './services/belvo-accounts.service';
import { BelvoTransactionsService } from './services/belvo-transactions.service';
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
  ],
  exports: [
    BelvoWidgetService,
    BelvoLinksService,
    BelvoAccountsService,
    BelvoTransactionsService,
  ],
})
export class BelvoModule {}
