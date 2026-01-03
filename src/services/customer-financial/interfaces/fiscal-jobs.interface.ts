export interface SyncInvoiceJob {
  customerId: string;
  linkId: string;
  invoiceId: string;
  invoiceData: any;
}

export interface SyncTaxReturnJob {
  customerId: string;
  linkId: string;
  taxReturnId: string;
  taxReturnData: any;
}

export interface SyncFiscalDataJob {
  customerId: string;
  linkId: string;
}

export const FISCAL_QUEUE = 'fiscal-sync';

export enum FiscalJobTypes {
  SYNC_INVOICE = 'sync-invoice',
  SYNC_TAX_RETURN = 'sync-tax-return',
  SYNC_ALL_FISCAL_DATA = 'sync-all-fiscal-data',
}
