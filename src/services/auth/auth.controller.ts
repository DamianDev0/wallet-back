import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CustomerSignUpDto } from './dto/customer-signup.dto';
import { AdminSignUpDto } from './dto/admin-sign-up.dto';
import { Public } from '@common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('customer/login')
  customerLogin(@Body() dto: LoginDto) {
    return this.authService.customerLogin(dto);
  }

  @Post('customer/signup')
  customerSignup(@Body() dto: CustomerSignUpDto) {
    return this.authService.customerSignup(dto);
  }

  @Post('admin/login')
  adminLogin(@Body() dto: LoginDto) {
    return this.authService.adminLogin(dto);
  }

  @Post('admin/signup')
  adminSignup(@Body() dto: AdminSignUpDto) {
    return this.authService.adminSignup(dto);
  }
}
