import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@common/services/jwt.service';
import { BcryptService } from '@common/services/bcrypt.service';
import { AdminService } from 'services/admin/services/admin.service';
import { CustomerService } from 'services/customer/customer.service';
import { CustomerSignUpDto } from './dto/customer-signup.dto';
import { AdminSignUpDto } from './dto/admin-sign-up.dto';
import { Customer } from '@modules/customer/entities/customer.entity';
import { Admin } from '@modules/admin/entities/admin.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly jwtService = new JwtService();

  constructor(
    private readonly adminService: AdminService,
    private readonly customerService: CustomerService,
    private readonly bcryptService: BcryptService,
  ) {}

  private async validatePassword(input: string, hash: string): Promise<void> {
    const isValid = await this.bcryptService.comparePassword(input, hash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');
  }

  private generateToken(user: Customer | Admin, role: 'customer' | 'admin') {
    return this.jwtService.signToken({
      sub: user.id,
      role,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }

  async customerLogin(dto: LoginDto) {
    const customer = await this.customerService.getCustomerByEmailWithPassword(
      dto.email,
    );

    if (!customer) throw new UnauthorizedException('Invalid credentials');
    if (!customer.isActive)
      throw new UnauthorizedException('Account is inactive');

    await this.validatePassword(dto.password, customer.password);

    const accessToken = this.generateToken(customer, 'customer');

    return { accessToken };
  }

  async customerSignup(dto: CustomerSignUpDto): Promise<Customer> {
    const existing = await this.customerService.getCustomerByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already registered');

    const customer = await this.customerService.createCustomer(dto);

    return customer;
  }

  async adminLogin(dto: LoginDto) {
    const admin = await this.adminService.getAdminByEmailWithPassword(
      dto.email,
    );

    if (!admin) throw new UnauthorizedException('Invalid credentials');
    if (!admin.isActive) throw new UnauthorizedException('Account is inactive');

    await this.validatePassword(dto.password, admin.password);

    const accessToken = this.generateToken(admin, 'admin');

    return { accessToken };
  }

  async adminSignup(dto: AdminSignUpDto): Promise<Admin> {
    const existing = await this.adminService.getAdminByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already registered');

    const admin = await this.adminService.createAdmin(dto);

    return admin;
  }
}
