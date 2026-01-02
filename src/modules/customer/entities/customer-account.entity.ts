import { CommonEntity } from '@common/entities/base-entity';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Customer } from './customer.entity';

@Entity('customer_accounts')
export class CustomerAccount extends CommonEntity {
  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'customer_id' })
  @Index()
  customerId: string;

  @Column({ name: 'belvo_account_id', unique: true })
  @Index()
  belvoAccountId: string;

  @Column({ name: 'belvo_link_id' })
  @Index()
  belvoLinkId: string;

  @Column()
  institution: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  number: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  currentBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  availableBalance: number;

  @Column({ default: 'MXN' })
  currency: string;

  @Column({ type: 'jsonb', nullable: true })
  rawData: any;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncedAt: Date;
}
