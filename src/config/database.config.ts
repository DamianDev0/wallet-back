import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Admin } from '@modules/admin/entities/admin.entity';
import { Customer } from '@modules/customer/entities/customer.entity';
import { CustomerAccount } from '@modules/customer/entities/customer-account.entity';
import { CustomerTransaction } from '@modules/customer/entities/customer-transaction.entity';
import { CustomerInvoice } from '@modules/customer/entities/customer-invoice.entity';
import { CustomerTaxReturn } from '@modules/customer/entities/customer-tax-return.entity';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'wallet_db',
  entities: [
    Admin,
    Customer,
    CustomerAccount,
    CustomerTransaction,
    CustomerInvoice,
    CustomerTaxReturn,
  ],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  ssl: {
    rejectUnauthorized: false,
  },
});
