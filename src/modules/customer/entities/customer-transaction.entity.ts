import { CommonEntity } from '@common/entities/base-entity';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Customer } from './customer.entity';
import { CustomerAccount } from './customer-account.entity';

@Entity('customer_transactions')
export class CustomerTransaction extends CommonEntity {
  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'customer_id' })
  @Index()
  customerId: string;

  @ManyToOne(() => CustomerAccount)
  @JoinColumn({ name: 'account_id' })
  account: CustomerAccount;

  @Column({ name: 'account_id' })
  @Index()
  accountId: string;

  @Column({ name: 'belvo_transaction_id', unique: true })
  @Index()
  belvoTransactionId: string;

  @Column({ name: 'belvo_account_id' })
  belvoAccountId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  balance: number;

  @Column({ default: 'MXN' })
  currency: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  subcategory: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  status: string;

  @Column({ type: 'date' })
  @Index()
  valueDate: Date;

  @Column({ type: 'date', nullable: true })
  accountingDate: Date;

  @Column({ type: 'timestamp' })
  collectedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  merchant: any;

  @Column({ type: 'jsonb', nullable: true })
  rawData: any;
}
