import { CommonEntity } from '@common/entities/base-entity';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Customer } from './customer.entity';

@Entity('customer_invoices')
export class CustomerInvoice extends CommonEntity {
  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'customer_id' })
  @Index()
  customerId: string;

  @Column({ name: 'belvo_invoice_id', unique: true })
  @Index()
  belvoInvoiceId: string;

  @Column({ name: 'belvo_link_id' })
  @Index()
  belvoLinkId: string;

  @Column({ name: 'type' })
  type: string;

  @Column({ name: 'folio', nullable: true })
  folio: string;

  @Column({ name: 'series', nullable: true })
  series: string;

  @Column({ name: 'invoice_date' })
  invoiceDate: Date;

  @Column({ name: 'invoice_type' })
  invoiceType: string;

  @Column({ name: 'status' })
  status: string;

  @Column({ name: 'usage', nullable: true })
  usage: string;

  @Column({ name: 'version', nullable: true })
  version: string;

  @Column({ name: 'payment_type', nullable: true })
  paymentType: string;

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: string;

  @Column({ name: 'place_of_issue', nullable: true })
  placeOfIssue: string;

  @Column({ name: 'certification_date', nullable: true })
  certificationDate: string;

  @Column({ name: 'certification_authority', nullable: true })
  certificationAuthority: string;

  @Column({ name: 'invoice_identification', nullable: true })
  invoiceIdentification: string;

  @Column({ name: 'sender_fiscal_regime', nullable: true })
  senderFiscalRegime: string;

  @Column({ name: 'sender_postal_code', nullable: true })
  senderPostalCode: string;

  @Column({ name: 'receiver_fiscal_regime', nullable: true })
  receiverFiscalRegime: string;

  @Column({ name: 'receiver_postal_code', nullable: true })
  receiverPostalCode: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 4, nullable: true })
  exchangeRate: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  discountAmount: number;

  @Column({ name: 'sender_name' })
  senderName: string;

  @Column({ name: 'sender_id' })
  senderId: string;

  @Column({ name: 'receiver_name' })
  receiverName: string;

  @Column({ name: 'receiver_id' })
  receiverId: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ name: 'subtotal_amount', type: 'decimal', precision: 15, scale: 2 })
  subtotalAmount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 15, scale: 2 })
  taxAmount: number;

  @Column({ name: 'currency', default: 'MXN' })
  currency: string;

  @Column({ name: 'collected_at', type: 'timestamp' })
  collectedAt: Date;

  @Column({ name: 'tax_details', type: 'jsonb', nullable: true })
  taxDetails: {
    tax_amount?: number;
    discount_amount?: number;
    retained_taxes?: any[];
    transferred_taxes?: any[];
    total_tax_retained?: number;
    total_tax_transferred?: number;
  };

  @Column({ name: 'payments', type: 'jsonb', nullable: true })
  payments: Array<{
    date: string;
    amount: number;
    currency: string;
    payment_type?: string;
    exchange_rate?: number;
    beneficiary_rfc?: string;
    related_documents?: any[];
  }>;

  @Column({ name: 'invoice_details', type: 'jsonb', nullable: true })
  invoiceDetails: Array<{
    quantity: number;
    unit_code?: string;
    description: string;
    unit_amount: number;
    total_amount: number;
    pre_tax_amount: number;
    tax_amount?: number;
    tax_percentage?: number;
    product_identification?: string;
    retained_taxes?: any[];
    transferred_taxes?: any[];
  }>;

  @Column({ name: 'related_invoices', type: 'jsonb', nullable: true })
  relatedInvoices: any[];
}
