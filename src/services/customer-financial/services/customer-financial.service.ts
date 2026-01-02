import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '@modules/customer/entities/customer.entity';
import { BelvoLinksService } from '@integrations/belvo/services/belvo-links.service';
import { BelvoWidgetService } from '@integrations/belvo/services/belvo-widget.service';
import { CustomerFinancialSyncService } from './customer-financial-sync.service';

@Injectable()
export class CustomerFinancialService {
  private readonly logger = new Logger(CustomerFinancialService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly belvoLinksService: BelvoLinksService,
    private readonly belvoWidgetService: BelvoWidgetService,
    private readonly syncService: CustomerFinancialSyncService,
  ) {}

  async getWidgetAccessToken(customerId: string) {
    this.logger.log(`🔵 Creating widget access token for customer: ${customerId}`);

    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (!customer.isActive) {
      throw new BadRequestException('Customer account is not active');
    }

    // Generar access_token temporal de Belvo
    const tokenResponse = await this.belvoWidgetService.createAccessToken();

    this.logger.log(`✅ Widget access token created for customer: ${customerId}`);

    return {
      access_token: tokenResponse.access,
      customer_id: customerId,
      external_id: customerId, // Esto se usará en el widget
    };
  }

  async linkBankAccount(customerId: string, linkId: string) {
    this.logger.log(`Linking bank account for customer: ${customerId}`);

    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (customer.belvoLinkId && customer.belvoActive) {
      throw new BadRequestException(
        'Customer already has an active bank link. Please unlink first.',
      );
    }

    const link = await this.belvoLinksService.getById(linkId);

    if (link.external_id !== customerId) {
      throw new BadRequestException(
        'Link ID does not match customer external ID',
      );
    }

    customer.belvoLinkId = linkId;
    customer.belvoLinkedAt = new Date();
    customer.belvoActive = true;

    await this.customerRepository.save(customer);

    // Sincronizar datos automáticamente después de vincular
    this.logger.log(`Starting automatic sync for customer: ${customerId}`);
    await this.syncService.syncCustomerData(customerId, linkId);

    this.logger.log(`Bank account linked successfully for customer: ${customerId}`);

    return {
      success: true,
      message: 'Bank account linked and data synced successfully',
      data: {
        customer_id: customer.id,
        link_id: linkId,
        linked_at: customer.belvoLinkedAt,
        institution: link.institution,
        status: link.status,
      },
    };
  }

  async unlinkBankAccount(customerId: string) {
    this.logger.log(`Unlinking bank account for customer: ${customerId}`);

    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (!customer.belvoLinkId) {
      throw new NotFoundException('Customer has no linked bank account');
    }

    try {
      await this.belvoLinksService.delete(customer.belvoLinkId);
    } catch (error) {
      this.logger.warn(
        `Failed to delete link from Belvo, but continuing: ${error.message}`,
      );
    }

    customer.belvoLinkId = null;
    customer.belvoActive = false;

    await this.customerRepository.save(customer);

    this.logger.log(`Bank account unlinked for customer: ${customerId}`);

    return {
      success: true,
      message: 'Bank account unlinked successfully',
    };
  }

  async getBankLinkStatus(customerId: string) {
    this.logger.log(`Getting bank link status for customer: ${customerId}`);

    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (!customer.belvoLinkId) {
      return {
        is_linked: false,
        message: 'No bank account linked',
      };
    }

    try {
      const link = await this.belvoLinksService.getById(customer.belvoLinkId);

      return {
        is_linked: true,
        link_id: customer.belvoLinkId,
        linked_at: customer.belvoLinkedAt,
        active: customer.belvoActive,
        institution: link.institution,
        status: link.status,
        access_mode: link.access_mode,
      };
    } catch (error) {
      customer.belvoActive = false;
      await this.customerRepository.save(customer);

      return {
        is_linked: false,
        message: 'Link no longer valid',
      };
    }
  }

  async getAccounts(customerId: string) {
    this.logger.log(`Getting accounts for customer: ${customerId}`);
    await this.ensureCustomerHasLink(customerId);
    return this.syncService.getCustomerAccounts(customerId);
  }

  async getTransactions(
    customerId: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    this.logger.log(`Getting transactions for customer: ${customerId}`);
    await this.ensureCustomerHasLink(customerId);
    return this.syncService.getCustomerTransactions(customerId, dateFrom, dateTo);
  }

  async getBalances(customerId: string) {
    this.logger.log(`Getting balances for customer: ${customerId}`);
    const accounts = await this.syncService.getCustomerAccounts(customerId);
    return accounts.map(account => ({
      account_id: account.id,
      account_name: account.name,
      current_balance: account.currentBalance,
      available_balance: account.availableBalance,
      currency: account.currency,
      last_synced: account.lastSyncedAt,
    }));
  }

  async syncData(customerId: string) {
    this.logger.log(`Manual sync requested for customer: ${customerId}`);

    const customer = await this.ensureCustomerHasLink(customerId);
    return this.syncService.syncCustomerData(customerId, customer.belvoLinkId);
  }

  async getFinancialSummary(customerId: string) {
    this.logger.log(`Getting financial summary for customer: ${customerId}`);

    const customer = await this.ensureCustomerHasLink(customerId);

    const [link, accounts, transactions] = await Promise.all([
      this.belvoLinksService.getById(customer.belvoLinkId),
      this.syncService.getCustomerAccounts(customerId),
      this.syncService.getCustomerTransactions(customerId, undefined, undefined, 100),
    ]);

    const totalBalance = accounts.reduce(
      (sum, acc) => sum + Number(acc.currentBalance),
      0,
    );

    const availableBalance = accounts.reduce(
      (sum, acc) => sum + Number(acc.availableBalance),
      0,
    );

    return {
      customer: {
        id: customer.id,
        full_name: customer.fullName,
        email: customer.email,
      },
      link_info: {
        link_id: customer.belvoLinkId,
        institution: link.institution,
        linked_at: customer.belvoLinkedAt,
        status: link.status,
      },
      accounts,
      transactions,
      summary: {
        total_accounts: accounts.length,
        total_transactions: transactions.length,
        total_balance: totalBalance,
        available_balance: availableBalance,
        currency: accounts[0]?.currency || 'MXN',
      },
    };
  }

  private async ensureCustomerHasLink(customerId: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (!customer.belvoLinkId || !customer.belvoActive) {
      throw new BadRequestException('Customer has no active bank link');
    }

    return customer;
  }
}
