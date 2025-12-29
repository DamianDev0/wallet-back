import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '@modules/customer/entities/customer.entity';
import { CustomerRepository } from '@modules/customer/repository/customer.repository';
import { CustomerService } from './customer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  providers: [
    CustomerService,
    {
      provide: 'ICustomerRepository',
      useClass: CustomerRepository,
    },
  ],
  exports: [CustomerService],
})
export class CustomerModule {}
