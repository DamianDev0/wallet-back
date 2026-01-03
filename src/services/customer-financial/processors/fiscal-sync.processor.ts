import { Processor, Process, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerInvoice } from '@modules/customer/entities/customer-invoice.entity';
import { CustomerTaxReturn } from '@modules/customer/entities/customer-tax-return.entity';
import {
  FISCAL_QUEUE,
  FiscalJobTypes,
  SyncInvoiceJob,
  SyncTaxReturnJob,
} from '../interfaces/fiscal-jobs.interface';

@Processor(FISCAL_QUEUE)
export class FiscalSyncProcessor {
  private readonly logger = new Logger(FiscalSyncProcessor.name);

  constructor(
    @InjectRepository(CustomerInvoice)
    private readonly invoiceRepository: Repository<CustomerInvoice>,
    @InjectRepository(CustomerTaxReturn)
    private readonly taxReturnRepository: Repository<CustomerTaxReturn>,
  ) {}

  @Process({ name: FiscalJobTypes.SYNC_INVOICE, concurrency: 10 })
  async processSyncInvoice(job: Job<SyncInvoiceJob>) {
    const { customerId, linkId, invoiceData } = job.data;

    this.logger.log(`Processing invoice ${invoiceData.id} for customer ${customerId}`);

    let invoice = await this.invoiceRepository.findOne({
      where: { belvoInvoiceId: invoiceData.id },
    });

    if (!invoice) {
      invoice = new CustomerInvoice();
      invoice.customerId = customerId;
      invoice.belvoLinkId = linkId;
      invoice.belvoInvoiceId = invoiceData.id;
    }

    invoice.type = invoiceData.type;
    invoice.folio = invoiceData.folio || null;
    invoice.series = invoiceData.series || null;
    invoice.invoiceDate = new Date(invoiceData.invoice_date);
    invoice.invoiceType = invoiceData.invoice_type;
    invoice.status = invoiceData.status;
    invoice.usage = invoiceData.usage || null;
    invoice.version = invoiceData.version || null;
    invoice.paymentType = invoiceData.payment_type || null;
    invoice.paymentMethod = invoiceData.payment_method || null;
    invoice.placeOfIssue = invoiceData.place_of_issue || null;
    invoice.certificationDate = invoiceData.certification_date || null;
    invoice.certificationAuthority = invoiceData.certification_authority || null;
    invoice.invoiceIdentification = invoiceData.invoice_identification || null;
    invoice.senderFiscalRegime = invoiceData.sender_fiscal_regime || null;
    invoice.senderPostalCode = invoiceData.sender_postal_code || null;
    invoice.receiverFiscalRegime = invoiceData.receiver_fiscal_regime || null;
    invoice.receiverPostalCode = invoiceData.receiver_postal_code || null;
    invoice.exchangeRate = invoiceData.exchange_rate || null;
    invoice.discountAmount = invoiceData.discount_amount || null;
    invoice.senderName = invoiceData.sender_name;
    invoice.senderId = invoiceData.sender_id;
    invoice.receiverName = invoiceData.receiver_name;
    invoice.receiverId = invoiceData.receiver_id;
    invoice.totalAmount = invoiceData.total_amount;
    invoice.subtotalAmount = invoiceData.subtotal_amount;
    invoice.taxAmount = invoiceData.tax_amount;
    invoice.currency = invoiceData.currency;
    invoice.collectedAt = new Date(invoiceData.collected_at);

    // Map tax_details if exists in raw data
    invoice.taxDetails = invoiceData.tax_details || null;

    // Map payments array
    invoice.payments = invoiceData.payments && invoiceData.payments.length > 0
      ? invoiceData.payments
      : null;

    // Map invoice_details array
    invoice.invoiceDetails = invoiceData.invoice_details && invoiceData.invoice_details.length > 0
      ? invoiceData.invoice_details
      : null;

    // Map related_invoices array
    invoice.relatedInvoices = invoiceData.related_invoices && invoiceData.related_invoices.length > 0
      ? invoiceData.related_invoices
      : null;

    await this.invoiceRepository.save(invoice);

    this.logger.log(`Invoice ${invoiceData.id} synced successfully`);
    return { success: true, invoiceId: invoiceData.id };
  }

  @Process({ name: FiscalJobTypes.SYNC_TAX_RETURN, concurrency: 10 })
  async processSyncTaxReturn(job: Job<SyncTaxReturnJob>) {
    const { customerId, linkId, taxReturnData } = job.data;

    this.logger.log(`Processing tax return ${taxReturnData.id} for customer ${customerId}`);

    let taxReturn = await this.taxReturnRepository.findOne({
      where: { belvoTaxReturnId: taxReturnData.id },
    });

    if (!taxReturn) {
      taxReturn = new CustomerTaxReturn();
      taxReturn.customerId = customerId;
      taxReturn.belvoLinkId = linkId;
      taxReturn.belvoTaxReturnId = taxReturnData.id;
    }

    taxReturn.fiscalYear = taxReturnData.informacion_general?.ejercicio;
    taxReturn.incomeTax = taxReturnData.determinacion_isr?.isr_pagar || 0;
    taxReturn.netIncome = taxReturnData.determinacion_isr?.base_gravable || 0;
    taxReturn.grossIncome = taxReturnData.sueldos_salarios?.ingresos_gravados || 0;
    taxReturn.collectedAt = new Date(taxReturnData.collected_at);

    await this.taxReturnRepository.save(taxReturn);

    this.logger.log(`Tax return ${taxReturnData.id} synced successfully`);
    return { success: true, taxReturnId: taxReturnData.id };
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`, error.stack);
  }
}
