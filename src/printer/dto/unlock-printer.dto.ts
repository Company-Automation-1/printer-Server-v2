import { IsNotEmpty, IsString } from 'class-validator';

export class UnlockPrinterDto {
  /** 打印机ID(MAC) @example 3E:71:BF:7F:05:2B */
  @IsString()
  @IsNotEmpty()
  printerId: string;
}
