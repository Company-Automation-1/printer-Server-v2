import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnlockPrinterDto {
  @ApiProperty({ description: '打印机ID' })
  @IsString()
  @IsNotEmpty()
  printerId: string;
}
