import { IsNotEmpty, IsString } from 'class-validator';

export class CountersPrinterDto {
  /** 打印机ID，如 3E-71-BF-7F-05-2B（会转为冒号格式查询） @example 3E-71-BF-7F-05-2B */
  @IsString()
  @IsNotEmpty()
  pid: string;
}
