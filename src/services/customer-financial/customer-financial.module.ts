import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { CustomerFinancialController } from './customer-financial.controller';
import { CustomerFinancialService } from './services/customer-financial.service';
import { CustomerFinancialSyncService } from './services/customer-financial-sync.service';
import { CustomerFiscalSyncService } from './services/customer-fiscal-sync.service';
import { FiscalSyncProcessor } from './processors/fiscal-sync.processor';
import { Customer } from '@modules/customer/entities/customer.entity';
import { CustomerAccount } from '@modules/customer/entities/customer-account.entity';
import { CustomerTransaction } from '@modules/customer/entities/customer-transaction.entity';
import { CustomerInvoice } from '@modules/customer/entities/customer-invoice.entity';
import { CustomerTaxReturn } from '@modules/customer/entities/customer-tax-return.entity';
import { BelvoModule } from '@integrations/belvo/belvo.module';
import { FISCAL_QUEUE } from './interfaces/fiscal-jobs.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      CustomerAccount,
      CustomerTransaction,
      CustomerInvoice,
      CustomerTaxReturn,
    ]),
    BullModule.registerQueue({
      name: FISCAL_QUEUE,
    }),
    BelvoModule,
  ],
  controllers: [CustomerFinancialController],
  providers: [
    CustomerFinancialService,
    CustomerFinancialSyncService,
    CustomerFiscalSyncService,
    FiscalSyncProcessor,
  ],
  exports: [
    CustomerFinancialService,
    CustomerFinancialSyncService,
    CustomerFiscalSyncService,
  ],
})
export class CustomerFinancialModule {}
