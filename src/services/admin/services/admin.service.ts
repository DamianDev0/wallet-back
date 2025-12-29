import { IAdminRepository } from '@modules/admin/repository/interface/admin.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { Admin } from '@modules/admin/entities/admin.entity';

@Injectable()
export class AdminService {
  constructor(
    @Inject('IAdminRepository')
    private readonly adminRepo: IAdminRepository,
  ) {}

  async getAdminById(id: string): Promise<Admin | null> {
    return this.adminRepo.findById(id);
  }

  async getAdminByEmail(email: string): Promise<Admin | null> {
    return this.adminRepo.findByEmail(email);
  }

  async getAdminByEmailWithPassword(email: string): Promise<Admin | null> {
    return this.adminRepo.findWithPassword(email);
  }

  async createAdmin(data: Partial<Admin>): Promise<Admin> {
    return this.adminRepo.create(data);
  }

  async updateAdmin(id: string, data: Partial<Admin>): Promise<Admin> {
    return this.adminRepo.update(id, data);
  }
}
