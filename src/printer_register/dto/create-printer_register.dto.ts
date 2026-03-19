import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePrinterRegisterDto {
  /** 局域网 IP */
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lanIp: string;

  /** 打印机 ID */
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  printerId: string;
}
