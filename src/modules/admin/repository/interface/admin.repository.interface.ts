import { Admin } from '@modules/admin/entities/admin.entity';

export interface IAdminRepository {
  findById(id: string): Promise<Admin | null>;
  findByEmail(email: string): Promise<Admin | null>;
  findWithPassword(email: string): Promise<Admin | null>;
  create(data: Partial<Admin>): Promise<Admin>;
  update(id: string, data: Partial<Admin>): Promise<Admin>;
}
