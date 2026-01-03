import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { CustomerInvoice } from '@modules/customer/entities/customer-invoice.entity';
import { CustomerTaxReturn } from '@modules/customer/entities/customer-tax-return.entity';
import { BelvoInvoicesService } from '@integrations/belvo/services/belvo-invoices.service';
import { BelvoTaxReturnsService } from '@integrations/belvo/services/belvo-tax-returns.service';
import {
  FISCAL_QUEUE,
  FiscalJobTypes,
} from '../interfaces/fiscal-jobs.interface';
import { PaginatedResponse, PaginationHelper } from '@common/interfaces/pagination.interface';

@Injectable()
export class CustomerFiscalSyncService {
  private readonly logger = new Logger(CustomerFiscalSyncService.name);

  constructor(
    @InjectRepository(CustomerInvoice)
    private readonly invoiceRepository: Repository<CustomerInvoice>,
    @InjectRepository(CustomerTaxReturn)
    private readonly taxReturnRepository: Repository<CustomerTaxReturn>,
    private readonly belvoInvoicesService: BelvoInvoicesService,
    private readonly belvoTaxReturnsService: BelvoTaxReturnsService,
    @InjectQueue(FISCAL_QUEUE) private readonly fiscalQueue: Queue,
  ) {}

  async syncFiscalData(customerId: string, linkId: string) {
    this.logger.log(`Starting fiscal data sync for customer: ${customerId}`);

    const [invoicesResult, taxReturnsResult] = await Promise.allSettled([
      this.syncInvoices(customerId, linkId),
      this.syncTaxReturns(customerId, linkId),
    ]);

    const results = {
      invoices: invoicesResult.status === 'fulfilled'
        ? invoicesResult.value
        : { queued: 0, errors: 1 },
      taxReturns: taxReturnsResult.status === 'fulfilled'
        ? taxReturnsResult.value
        : { queued: 0, errors: 1 },
    };

    if (invoicesResult.status === 'rejected') {
      this.logger.error(`Failed to queue invoices: ${invoicesResult.reason}`);
    }

    if (taxReturnsResult.status === 'rejected') {
      this.logger.error(`Failed to queue tax returns: ${taxReturnsResult.reason}`);
    }

    this.logger.log(
      `Fiscal sync queued for customer ${customerId}: ${JSON.stringify(results)}`,
    );

    return results;
  }

  async syncInvoices(customerId: string, linkId: string) {
    this.logger.log(`Syncing invoices for customer: ${customerId}`);

    const today = new Date();
    const dateFrom = new Date(today);
    dateFrom.setDate(dateFrom.getDate() - 365);

    const invoices = await this.belvoInvoicesService.retrieve({
      link: linkId,
      date_from: dateFrom.toISOString().split('T')[0],
      date_to: today.toISOString().split('T')[0],
      type: 'OUTFLOW',
      save_data: true,
    });

    this.logger.log(`Retrieved ${invoices.length} invoices, adding to queue`);

    let queued = 0;
    let errors = 0;

    const jobPromises = invoices.map(async (invoice) => {
      try {
        await this.fiscalQueue.add(
          FiscalJobTypes.SYNC_INVOICE,
          {
            customerId,
            linkId,
            invoiceId: invoice.id,
            invoiceData: invoice,
          },
          {
            priority: 1,
            removeOnComplete: true,
          },
        );
        queued++;
      } catch (error) {
        this.logger.error(`Failed to queue invoice ${invoice.id}: ${error.message}`);
        errors++;
      }
    });

    await Promise.all(jobPromises);

    this.logger.log(`Invoices queued: ${queued}, errors: ${errors}`);
    return { queued, errors };
  }

  async syncTaxReturns(customerId: string, linkId: string) {
    this.logger.log(`Syncing tax returns for customer: ${customerId}`);

    const currentYear = new Date().getFullYear();
    const yearFrom = `${currentYear - 3}`;
    const yearTo = `${currentYear}`;

    const taxReturns = await this.belvoTaxReturnsService.retrieve({
      link: linkId,
      year_from: yearFrom,
      year_to: yearTo,
      save_data: true,
    });

    this.logger.log(`Retrieved ${taxReturns.length} tax returns, adding to queue`);

    let queued = 0;
    let errors = 0;

    const jobPromises = taxReturns.map(async (taxReturn) => {
      try {
        await this.fiscalQueue.add(
          FiscalJobTypes.SYNC_TAX_RETURN,
          {
            customerId,
            linkId,
            taxReturnId: taxReturn.id,
            taxReturnData: taxReturn,
          },
          {
            priority: 1,
            removeOnComplete: true,
          },
        );
        queued++;
      } catch (error) {
        this.logger.error(`Failed to queue tax return ${taxReturn.id}: ${error.message}`);
        errors++;
      }
    });

    await Promise.all(jobPromises);

    this.logger.log(`Tax returns queued: ${queued}, errors: ${errors}`);
    return { queued, errors };
  }

  async getSyncStatus(customerId: string) {
    const [waiting, active, completed, failed] = await Promise.all([
      this.fiscalQueue.getWaiting(),
      this.fiscalQueue.getActive(),
      this.fiscalQueue.getCompleted(),
      this.fiscalQueue.getFailed(),
    ]);

    const customerJobs = {
      waiting: waiting.filter((job) => job.data.customerId === customerId).length,
      active: active.filter((job) => job.data.customerId === customerId).length,
      completed: completed.filter((job) => job.data.customerId === customerId).length,
      failed: failed.filter((job) => job.data.customerId === customerId).length,
    };

    return {
      total: customerJobs.waiting + customerJobs.active + customerJobs.completed + customerJobs.failed,
      ...customerJobs,
    };
  }

  async getCustomerInvoices(
    customerId: string,
    page: number = 1,
    limit: number = 10,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<PaginatedResponse<CustomerInvoice>> {
    const query = this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.customerId = :customerId', { customerId })
      .orderBy('invoice.invoiceDate', 'DESC');

    if (dateFrom) {
      query.andWhere('invoice.invoiceDate >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      query.andWhere('invoice.invoiceDate <= :dateTo', { dateTo });
    }

    const total = await query.getCount();
    const skip = PaginationHelper.getSkip(page, limit);

    const invoices = await query
      .skip(skip)
      .take(limit)
      .getMany();

    return PaginationHelper.paginate(invoices, total, page, limit);
  }

  async getCustomerTaxReturns(
    customerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<CustomerTaxReturn>> {
    const [taxReturns, total] = await this.taxReturnRepository.findAndCount({
      where: { customerId },
      order: { fiscalYear: 'DESC' },
      skip: PaginationHelper.getSkip(page, limit),
      take: limit,
    });

    return PaginationHelper.paginate(taxReturns, total, page, limit);
  }

  async getInvoiceById(invoiceId: string): Promise<CustomerInvoice> {
    return this.invoiceRepository.findOne({
      where: { id: invoiceId },
    });
  }

  async getTaxReturnById(taxReturnId: string): Promise<CustomerTaxReturn> {
    return this.taxReturnRepository.findOne({
      where: { id: taxReturnId },
    });
  }
}
