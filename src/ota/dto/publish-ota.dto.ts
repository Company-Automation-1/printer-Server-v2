import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class PublishOtaDto {
  /** 打印机ID，不传则广播到所有设备 */
  @IsString()
  @IsOptional()
  printerId?: string;

  /** 固件版本号 @example 1.0.0 */
  @IsString()
  @IsNotEmpty()
  version: string;

  /** 固件下载 URL @example http://example.com/ota/firmware.bin */
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  url: string;
}
