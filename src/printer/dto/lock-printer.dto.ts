import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum LockStatus {
  Lock = 'lock',
  Unlock = 'unlock',
}

export class LockPrinterDto {
  @ApiProperty({ description: '打印机ID' })
  @IsString()
  @IsNotEmpty()
  printerId: string;

  @ApiProperty({ description: '锁定状态', enum: LockStatus })
  @IsEnum(LockStatus)
  status: LockStatus;
}
