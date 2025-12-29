import { IAdminRepository } from './interface/admin.repository.interface';
import { Repository } from 'typeorm';
import { Admin } from '../entities/admin.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AdminRepository implements IAdminRepository {
  constructor(
    @InjectRepository(Admin)
    private readonly repo: Repository<Admin>,
  ) {}

  async findById(id: string): Promise<Admin | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<Admin | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findWithPassword(email: string): Promise<Admin | null> {
    return this.repo
      .createQueryBuilder('admin')
      .where('admin.email = :email', { email })
      .addSelect('admin.password')
      .getOne();
  }

  async create(data: Partial<Admin>): Promise<Admin> {
    const admin = this.repo.create(data);
    return this.repo.save(admin);
  }

  async update(id: string, data: Partial<Admin>): Promise<Admin> {
    await this.repo.update(id, data);
    return this.findById(id);
  }
}
