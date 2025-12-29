import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminModule } from 'services/admin/admin.module';
import { CustomerModule } from 'services/customer/customer.module';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [CommonModule, AdminModule, CustomerModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
