import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '@modules/customer/entities/customer.entity';
import { CustomerAccount } from '@modules/customer/entities/customer-account.entity';
import { CustomerTransaction } from '@modules/customer/entities/customer-transaction.entity';
import { BelvoAccountsService } from '@integrations/belvo/services/belvo-accounts.service';
import { BelvoTransactionsService } from '@integrations/belvo/services/belvo-transactions.service';

@Injectable()
export class CustomerFinancialSyncService {
  private readonly logger = new Logger(CustomerFinancialSyncService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(CustomerAccount)
    private readonly accountRepository: Repository<CustomerAccount>,
    @InjectRepository(CustomerTransaction)
    private readonly transactionRepository: Repository<CustomerTransaction>,
    private readonly belvoAccountsService: BelvoAccountsService,
    private readonly belvoTransactionsService: BelvoTransactionsService,
  ) {}

  async syncCustomerData(customerId: string, linkId: string) {
    this.logger.log(
      `Starting sync for customer: ${customerId}, link: ${linkId}`,
    );

    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const [accounts, transactions] = await Promise.all([
      this.syncAccounts(customer, linkId),
      this.syncTransactions(customer, linkId),
    ]);

    this.logger.log(
      `Sync completed: ${accounts.length} accounts, ${transactions.length} transactions`,
    );

    return {
      accounts,
      transactions,
      synced_at: new Date(),
    };
  }

  private async syncAccounts(customer: Customer, linkId: string) {
    this.logger.log(`Syncing accounts for link: ${linkId}`);

    const belvoAccounts = await this.belvoAccountsService.retrieve(linkId);

    const savedAccounts = [];

    for (const belvoAccount of belvoAccounts) {
      let account = await this.accountRepository.findOne({
        where: { belvoAccountId: belvoAccount.id },
      });

      if (account) {
        account.currentBalance = belvoAccount.balance?.current || 0;
        account.availableBalance = belvoAccount.balance?.available || 0;
        account.lastSyncedAt = new Date();
        account.rawData = belvoAccount;
      } else {
        account = this.accountRepository.create({
          customerId: customer.id,
          belvoAccountId: belvoAccount.id,
          belvoLinkId: linkId,
          institution: belvoAccount.institution?.name || 'Unknown',
          name: belvoAccount.name,
          type: belvoAccount.type,
          category: belvoAccount.category,
          number: belvoAccount.number,
          currentBalance: belvoAccount.balance?.current || 0,
          availableBalance: belvoAccount.balance?.available || 0,
          currency: belvoAccount.currency,
          rawData: belvoAccount,
          lastSyncedAt: new Date(),
        });
      }

      savedAccounts.push(await this.accountRepository.save(account));
    }

    return savedAccounts;
  }

  private async syncTransactions(customer: Customer, linkId: string) {
    this.logger.log(`Syncing transactions for link: ${linkId}`);

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 90);

    const belvoTransactions = await this.belvoTransactionsService.retrieve({
      link_id: linkId,
      date_from: dateFrom.toISOString().split('T')[0],
    });

    const savedTransactions = [];

    for (const belvoTx of belvoTransactions) {
      const exists = await this.transactionRepository.findOne({
        where: { belvoTransactionId: belvoTx.id },
      });

      if (exists) {
        continue;
      }

      const account = await this.accountRepository.findOne({
        where: { belvoAccountId: belvoTx.account.id },
      });

      if (!account) {
        this.logger.warn(`Account not found for transaction: ${belvoTx.id}`);
        continue;
      }

      const transaction = this.transactionRepository.create({
        customerId: customer.id,
        accountId: account.id,
        belvoTransactionId: belvoTx.id,
        belvoAccountId: belvoTx.account.id,
        amount: belvoTx.amount,
        balance: belvoTx.balance,
        currency: belvoTx.currency,
        description: belvoTx.description,
        observations: belvoTx.observations,
        category: belvoTx.category,
        subcategory: belvoTx.subcategory,
        type: belvoTx.type,
        status: belvoTx.status,
        valueDate: new Date(belvoTx.value_date),
        accountingDate: belvoTx.accounting_date
          ? new Date(belvoTx.accounting_date)
          : null,
        collectedAt: new Date(belvoTx.collected_at),
        merchant: belvoTx.merchant,
        rawData: belvoTx,
      });

      savedTransactions.push(
        await this.transactionRepository.save(transaction),
      );
    }

    return savedTransactions;
  }

  async getCustomerTransactions(
    customerId: string,
    dateFrom?: string,
    dateTo?: string,
    limit = 100,
  ) {
    const query = this.transactionRepository
      .createQueryBuilder('tx')
      .leftJoinAndSelect('tx.account', 'account')
      .where('tx.customerId = :customerId', { customerId })
      .orderBy('tx.valueDate', 'DESC')
      .limit(limit);

    if (dateFrom) {
      query.andWhere('tx.valueDate >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      query.andWhere('tx.valueDate <= :dateTo', { dateTo });
    }

    return query.getMany();
  }

  async getCustomerAccounts(customerId: string) {
    return this.accountRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }
}
