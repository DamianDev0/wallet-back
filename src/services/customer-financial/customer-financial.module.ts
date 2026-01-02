import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerFinancialController } from './customer-financial.controller';
import { CustomerFinancialService } from './services/customer-financial.service';
import { CustomerFinancialSyncService } from './services/customer-financial-sync.service';
import { Customer } from '@modules/customer/entities/customer.entity';
import { CustomerAccount } from '@modules/customer/entities/customer-account.entity';
import { CustomerTransaction } from '@modules/customer/entities/customer-transaction.entity';
import { BelvoModule } from '@integrations/belvo/belvo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, CustomerAccount, CustomerTransaction]),
    BelvoModule,
  ],
  controllers: [CustomerFinancialController],
  providers: [CustomerFinancialService, CustomerFinancialSyncService],
  exports: [CustomerFinancialService, CustomerFinancialSyncService],
})
export class CustomerFinancialModule {}
