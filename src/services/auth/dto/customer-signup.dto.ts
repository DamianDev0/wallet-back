import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CustomerSignUpDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
