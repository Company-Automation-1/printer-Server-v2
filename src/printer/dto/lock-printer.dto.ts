import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum LockType {
  BILLING = 'BILLING',
  MANUAL = 'MANUAL',
}

export class LockPrinterDto {
  @ApiProperty({ description: '打印机ID' })
  @IsString()
  @IsNotEmpty()
  printerId: string;

  @ApiProperty({ description: '锁定状态', enum: LockType })
  @IsEnum(LockType)
  lockType: LockType;
}
