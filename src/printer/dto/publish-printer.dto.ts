import { IsString, IsOptional, IsNotEmpty, IsUrl } from 'class-validator';

export class OtaUpdatePrinterDto {
  @IsString()
  @IsOptional()
  printerId?: string;

  @IsString()
  @IsNotEmpty()
  version: string;

  @IsUrl()
  @IsNotEmpty()
  url: string;
}
