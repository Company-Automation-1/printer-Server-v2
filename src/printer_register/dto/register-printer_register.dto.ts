import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RegisterPrinterRegisterDto {
  /**
   * 标识 (可读唯一标识)
   * @example PRINTER-001
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  identifier: string;
}
