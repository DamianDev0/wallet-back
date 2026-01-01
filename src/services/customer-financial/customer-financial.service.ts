import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '@modules/customer/entities/customer.entity';
import { BelvoWidgetService } from '@integrations/belvo/services/belvo-widget.service';
import { BelvoLinksService } from '@integrations/belvo/services/belvo-links.service';
import { BelvoAccountsService } from '@integrations/belvo/services/belvo-accounts.service';
import { BelvoTransactionsService } from '@integrations/belvo/services/belvo-transactions.service';

@Injectable()
export class CustomerFinancialService {
  private readonly logger = new Logger(CustomerFinancialService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly belvoWidgetService: BelvoWidgetService,
    private readonly belvoLinksService: BelvoLinksService,
    private readonly belvoAccountsService: BelvoAccountsService,
    private readonly belvoTransactionsService: BelvoTransactionsService,
  ) {}

  async createWidgetToken(customerId: string) {
    this.logger.log(`Creating widget token for customer: ${customerId}`);

    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (!customer.isActive) {
      throw new BadRequestException('Customer account is not active');
    }

    const tokenResponse = await this.belvoWidgetService.createToken({
      access_mode: 'single',
      external_id: customerId,
    });

    this.logger.log(`Widget token created for customer: ${customerId}`);

    return {
      access_token: tokenResponse.access,
      customer_id: customerId,
      external_id: customerId,
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

    this.logger.log(`Bank account linked successfully for customer: ${customerId}`);

    return {
      success: true,
      message: 'Bank account linked successfully',
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

    const customer = await this.ensureCustomerHasLink(customerId);
    return this.belvoAccountsService.retrieve(customer.belvoLinkId);
  }

  async getTransactions(
    customerId: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    this.logger.log(`Getting transactions for customer: ${customerId}`);

    const customer = await this.ensureCustomerHasLink(customerId);

    return this.belvoTransactionsService.retrieve({
      link_id: customer.belvoLinkId,
      date_from: dateFrom,
      date_to: dateTo,
    });
  }

  async getBalances(customerId: string) {
    this.logger.log(`Getting balances for customer: ${customerId}`);

    const customer = await this.ensureCustomerHasLink(customerId);
    return this.belvoAccountsService.getBalances(customer.belvoLinkId);
  }

  async getFinancialSummary(customerId: string) {
    this.logger.log(`Getting financial summary for customer: ${customerId}`);

    const customer = await this.ensureCustomerHasLink(customerId);

    const [link, accounts, transactions, balances] = await Promise.all([
      this.belvoLinksService.getById(customer.belvoLinkId),
      this.belvoAccountsService.retrieve(customer.belvoLinkId),
      this.belvoTransactionsService.retrieve({ link_id: customer.belvoLinkId }),
      this.belvoAccountsService.getBalances(customer.belvoLinkId),
    ]);

    const totalBalance = accounts.reduce(
      (sum, acc) => sum + (acc.balance?.current || 0),
      0,
    );

    const availableBalance = accounts.reduce(
      (sum, acc) => sum + (acc.balance?.available || 0),
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
      balances,
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
