import { Customer } from '../entities/customer.entity';

export interface ICustomerRepository {
  findByEmail(email: string): Promise<Customer | null>;
  findByEmailWithPassword(email: string): Promise<Customer | null>;
  findById(id: string): Promise<Customer | null>;
  create(data: Partial<Customer>): Promise<Customer>;
  update(id: string, data: Partial<Customer>): Promise<Customer>;
}
