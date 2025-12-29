import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Admin } from '@modules/admin/entities/admin.entity';
import { Customer } from '@modules/customer/entities/customer.entity';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'wallet_db',
  entities: [Admin, Customer],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  ssl: {
    rejectUnauthorized: false,
  },
});
