import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CountersPrinterDto {
  @ApiProperty({
    description: '打印机ID，如 3E-71-BF-7F-05-2B（会转为冒号格式查询）',
  })
  @IsString()
  @IsNotEmpty()
  pid: string;
}
