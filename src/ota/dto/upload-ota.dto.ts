import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadOtaDto {
  /** 固件版本号 @example 1.0.0 */
  @IsString()
  @IsNotEmpty()
  version: string;

  /** 固件文件 */
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;
}
