import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './services/auth/auth.module';
import { CommonModule } from './common/common.module';
import { BelvoModule } from './integrations/belvo/belvo.module';
import { CustomerFinancialModule } from './services/customer-financial/customer-financial.module';
import { getDatabaseConfig } from './config/database.config';
import { getBullConfig } from './config/bull.config';
import { envValidationSchema } from './config/env.validation';
import { AuthGuard } from './common/guards/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    TypeOrmModule.forRoot(getDatabaseConfig()),
    BullModule.forRoot(getBullConfig()),
    CommonModule,
    AuthModule,
    BelvoModule,
    CustomerFinancialModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
