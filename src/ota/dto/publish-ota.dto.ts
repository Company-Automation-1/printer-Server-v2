import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PublishOtaDto {
  @ApiProperty({ description: '打印机ID' })
  @IsString()
  @IsOptional()
  printerId?: string;

  @ApiProperty({ description: '固件版本号' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ description: '固件url' })
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  url: string;
}
