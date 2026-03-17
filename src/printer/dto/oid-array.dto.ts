import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class OidCallbackDto {
  /** OID 列表 @example ["1.3.6.1.2.1.1.0"] */
  @IsArray()
  @IsString({ each: true })
  oids: string[];

  /** 回调 URL，设备响应后 POST 结果到此地址 @example https://example.com/webhook/oid */
  @IsUrl({ require_tld: false })
  callback: string;

  /** 请求 ID，不传则服务端生成 */
  @IsOptional()
  @IsString()
  requestId?: string;
}
