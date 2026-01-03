export interface BelvoInvoice {
  id: string;
  link: string;
  collected_at: string;
  created_at: string;
  invoice_identification: string;
  invoice_date: string;
  status: string;
  invoice_type: string;
  type: string;
  sender_id: string;
  sender_name: string;
  sender_fiscal_regime?: string;
  sender_postal_code?: string;
  receiver_id: string;
  receiver_name: string;
  receiver_fiscal_regime?: string;
  receiver_postal_code?: string;
  cancelation_status: string;
  cancelation_update_date: string;
  certification_date: string;
  certification_authority: string;
  payment_type: string;
  payment_type_description: string;
  payment_method?: string;
  place_of_issue?: string;
  usage: string;
  version: string;
  folio: string;
  series: string;
  invoice_details: InvoiceDetail[];
  tax_details?: TaxDetails;
  related_invoices?: any[];
  currency: string;
  subtotal_amount: number;
  exchange_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payments: InvoicePayment[];
  payroll: any;
  xml?: string;
}

export interface TaxDetails {
  collected_at?: string;
  retained_taxes?: Array<{
    tax: string;
    tax_type?: string;
    tax_amount: number;
    collected_at?: string;
    pre_tax_amount?: number;
    tax_percentage?: number;
  }>;
  transferred_taxes?: Array<{
    tax: string;
    tax_type?: string;
    tax_amount: number;
    collected_at?: string;
    pre_tax_amount?: number;
    tax_percentage?: number;
  }>;
  total_tax_retained?: number;
  total_tax_transferred?: number;
  tax_amount?: number;
  discount_amount?: number;
}

export interface InvoiceDetail {
  description: string;
  product_identification: string;
  quantity: number;
  unit_code: string;
  unit_description: string;
  unit_amount: number;
  pre_tax_amount: number;
  tax_percentage: number;
  tax_amount: number;
  total_amount: number;
  retained_taxes: any[];
  transferred_taxes?: any[];
  collected_at: string;
}

export interface InvoicePayment {
  date: string;
  payment_type: string;
  currency: string;
  amount: number;
  operation_number?: string;
  beneficiary_rfc?: string;
  beneficiary_account_number?: string;
  payer_rfc?: string;
  payer_account_number?: string;
  payer_bank_name?: string;
  exchange_rate?: number;
  collected_at?: string;
  related_documents?: any[];
}

export interface BelvoInvoicesListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BelvoInvoice[];
}

export interface BelvoInvoicesRetrieveRequest {
  link: string;
  date_from: string;
  date_to: string;
  type: string;
  attach_xml?: boolean;
  save_data?: boolean;
}
