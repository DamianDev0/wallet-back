import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { ICustomerRepository } from './customer.repository.interface';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
  ) {}

  async findByEmail(email: string): Promise<Customer | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<Customer | null> {
    return this.repo
      .createQueryBuilder('customer')
      .where('customer.email = :email', { email })
      .addSelect('customer.password')
      .getOne();
  }

  async findById(id: string): Promise<Customer | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<Customer>): Promise<Customer> {
    const customer = this.repo.create(data);
    return this.repo.save(customer);
  }

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    await this.repo.update(id, data);
    return this.findById(id);
  }
}
