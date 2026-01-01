import { IsString, IsOptional, IsEnum, IsUrl } from 'class-validator';

export class CreateWidgetTokenDto {
  @IsOptional()
  @IsEnum(['single', 'recurrent'])
  access_mode?: 'single' | 'recurrent';

  @IsOptional()
  @IsString()
  external_id?: string;

  @IsOptional()
  @IsUrl()
  callback_url?: string;

  @IsOptional()
  @IsEnum(['embedded', 'standalone'])
  widget_type?: 'embedded' | 'standalone';
}
