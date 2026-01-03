import { CommonEntity } from '@common/entities/base-entity';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Customer } from './customer.entity';

@Entity('customer_tax_returns')
export class CustomerTaxReturn extends CommonEntity {
  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'customer_id' })
  @Index()
  customerId: string;

  @Column({ name: 'belvo_tax_return_id', unique: true })
  @Index()
  belvoTaxReturnId: string;

  @Column({ name: 'belvo_link_id' })
  @Index()
  belvoLinkId: string;

  @Column({ name: 'fiscal_year', nullable: true })
  fiscalYear: string;

  @Column({ name: 'income_tax', type: 'decimal', precision: 15, scale: 2, nullable: true })
  incomeTax: number;

  @Column({ name: 'net_income', type: 'decimal', precision: 15, scale: 2, nullable: true })
  netIncome: number;

  @Column({ name: 'gross_income', type: 'decimal', precision: 15, scale: 2, nullable: true })
  grossIncome: number;

  @Column({ name: 'collected_at', type: 'timestamp' })
  collectedAt: Date;
}
