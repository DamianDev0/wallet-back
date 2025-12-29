import { Injectable, Inject } from '@nestjs/common';
import { ICustomerRepository } from '@modules/customer/repository/customer.repository.interface';
import { Customer } from '@modules/customer/entities/customer.entity';

@Injectable()
export class CustomerService {
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async getCustomerByEmail(email: string): Promise<Customer | null> {
    return this.customerRepo.findByEmail(email);
  }

  async getCustomerByEmailWithPassword(email: string): Promise<Customer | null> {
    return this.customerRepo.findByEmailWithPassword(email);
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    return this.customerRepo.findById(id);
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    return this.customerRepo.create(data);
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    return this.customerRepo.update(id, data);
  }
}
