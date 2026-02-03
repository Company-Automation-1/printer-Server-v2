import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadOtaDto {
  @ApiProperty({ description: '固件版本号' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ type: 'string', format: 'binary', description: '固件文件' })
  file: Express.Multer.File;
}
