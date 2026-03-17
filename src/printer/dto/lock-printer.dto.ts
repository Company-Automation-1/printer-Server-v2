import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum LockType {
  BILLING = 'BILLING',
  MANUAL = 'MANUAL',
}

export class LockPrinterDto {
  /** 打印机ID(MAC) @example 3E:71:BF:7F:05:2B */
  @IsString()
  @IsNotEmpty()
  printerId: string;

  /** 锁定类型 */
  @ApiProperty({ enum: LockType })
  @IsEnum(LockType)
  lockType: LockType;
}
