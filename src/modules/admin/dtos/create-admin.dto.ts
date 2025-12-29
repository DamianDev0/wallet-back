import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
