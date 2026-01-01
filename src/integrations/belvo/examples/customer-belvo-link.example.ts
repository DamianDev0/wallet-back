/**
 * EJEMPLO: Cómo guardar el link_id de Belvo en la entidad Customer
 *
 * Este es un ejemplo de implementación. Debes adaptar según tu estructura.
 */

// 1. Agregar columna a la entidad Customer
// src/modules/customer/entities/customer.entity.ts
/*
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  // ... otros campos

  @Column({ nullable: true, name: 'belvo_link_id' })
  belvoLinkId?: string;

  @Column({ nullable: true, name: 'belvo_linked_at' })
  belvoLinkedAt?: Date;

  @Column({ default: false, name: 'belvo_active' })
  belvoActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
*/

// 2. Crear un servicio que combine Customer y Belvo
// src/services/customer-financial/customer-financial.service.ts
/*
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '@modules/customer/entities/customer.entity';
import { BelvoService } from '@integrations/belvo';

@Injectable()
export class CustomerFinancialService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly belvoService: BelvoService,
  ) {}

  async linkCustomerBank(customerId: string, linkId: string) {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Verificar que el link existe en Belvo
    await this.belvoService.getLinkById(linkId);

    // Guardar link_id en el customer
    customer.belvoLinkId = linkId;
    customer.belvoLinkedAt = new Date();
    customer.belvoActive = true;

    await this.customerRepository.save(customer);

    return {
      success: true,
      message: 'Bank account linked successfully',
      customer,
    };
  }

  async unlinkCustomerBank(customerId: string) {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer || !customer.belvoLinkId) {
      throw new NotFoundException('Customer or bank link not found');
    }

    // Eliminar link en Belvo
    await this.belvoService.deleteLink(customer.belvoLinkId);

    // Actualizar customer
    customer.belvoLinkId = null;
    customer.belvoActive = false;

    await this.customerRepository.save(customer);

    return {
      success: true,
      message: 'Bank account unlinked successfully',
    };
  }

  async getCustomerFinancialData(customerId: string) {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer || !customer.belvoLinkId) {
      throw new NotFoundException('Customer has no linked bank account');
    }

    // Obtener datos financieros de Belvo
    const financialData = await this.belvoService.getFinancialSummary(
      customer.belvoLinkId,
    );

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      },
      linkedAt: customer.belvoLinkedAt,
      financialData,
    };
  }

  async getCustomerAccounts(customerId: string) {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer || !customer.belvoLinkId) {
      throw new NotFoundException('Customer has no linked bank account');
    }

    return this.belvoService.getAccounts(customer.belvoLinkId);
  }

  async getCustomerTransactions(
    customerId: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer || !customer.belvoLinkId) {
      throw new NotFoundException('Customer has no linked bank account');
    }

    return this.belvoService.getTransactions({
      link_id: customer.belvoLinkId,
      date_from: dateFrom,
      date_to: dateTo,
    });
  }
}
*/

// 3. Crear el controlador
// src/services/customer-financial/customer-financial.controller.ts
/*
import { Controller, Post, Get, Delete, Param, Body, Query } from '@nestjs/common';
import { CustomerFinancialService } from './customer-financial.service';

@Controller('customers/:customerId/financial')
export class CustomerFinancialController {
  constructor(
    private readonly customerFinancialService: CustomerFinancialService,
  ) {}

  @Post('link')
  async linkBank(
    @Param('customerId') customerId: string,
    @Body('link_id') linkId: string,
  ) {
    return this.customerFinancialService.linkCustomerBank(customerId, linkId);
  }

  @Delete('unlink')
  async unlinkBank(@Param('customerId') customerId: string) {
    return this.customerFinancialService.unlinkCustomerBank(customerId);
  }

  @Get('summary')
  async getFinancialData(@Param('customerId') customerId: string) {
    return this.customerFinancialService.getCustomerFinancialData(customerId);
  }

  @Get('accounts')
  async getAccounts(@Param('customerId') customerId: string) {
    return this.customerFinancialService.getCustomerAccounts(customerId);
  }

  @Get('transactions')
  async getTransactions(
    @Param('customerId') customerId: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ) {
    return this.customerFinancialService.getCustomerTransactions(
      customerId,
      dateFrom,
      dateTo,
    );
  }
}
*/

// 4. Flujo completo desde el frontend
/*
// En React Native:

// 1. Usuario toca "Conectar banco"
const handleConnectBank = async () => {
  // Obtener token del widget
  const { access } = await fetch(`${API_URL}/belvo/widget/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      external_id: currentUser.id,
    }),
  }).then(r => r.json());

  // Abrir widget
  setWidgetToken(access);
  setShowWidget(true);
};

// 2. Cuando el usuario completa el proceso en el widget
const handleWidgetSuccess = async (linkId: string) => {
  // Guardar link_id asociado al customer
  await fetch(`${API_URL}/customers/${currentUser.id}/financial/link`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      link_id: linkId,
    }),
  });

  setShowWidget(false);
  Alert.alert('Éxito', 'Cuenta bancaria vinculada correctamente');
};

// 3. Obtener datos financieros
const fetchFinancialData = async () => {
  const data = await fetch(
    `${API_URL}/customers/${currentUser.id}/financial/summary`,
    {
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    }
  ).then(r => r.json());

  setAccounts(data.financialData.accounts);
  setTransactions(data.financialData.transactions);
  setBalances(data.financialData.balances);
};
*/
