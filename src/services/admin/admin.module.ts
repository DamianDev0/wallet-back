import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '@modules/admin/entities/admin.entity';
import { AdminRepository } from '@modules/admin/repository/admin.repository';
import { AdminService } from './services/admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Admin])],
  providers: [
    AdminService,
    {
      provide: 'IAdminRepository',
      useClass: AdminRepository,
    },
  ],
  exports: [AdminService],
})
export class AdminModule {}
