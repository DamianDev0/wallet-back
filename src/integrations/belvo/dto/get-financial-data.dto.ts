import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class GetFinancialDataDto {
  @IsString()
  @IsNotEmpty()
  link_id: string;

  @IsOptional()
  @IsDateString()
  date_from?: string;

  @IsOptional()
  @IsDateString()
  date_to?: string;
}

export class SaveLinkDto {
  @IsString()
  @IsNotEmpty()
  link_id: string;

  @IsOptional()
  @IsString()
  external_id?: string;
}
