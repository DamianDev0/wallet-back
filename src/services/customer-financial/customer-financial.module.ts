import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerFinancialController } from './customer-financial.controller';
import { CustomerFinancialService } from './customer-financial.service';
import { Customer } from '@modules/customer/entities/customer.entity';
import { BelvoModule } from '@integrations/belvo/belvo.module';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), BelvoModule],
  controllers: [CustomerFinancialController],
  providers: [CustomerFinancialService],
  exports: [CustomerFinancialService],
})
export class CustomerFinancialModule {}
