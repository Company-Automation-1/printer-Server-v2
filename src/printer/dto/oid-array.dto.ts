import { IsArray, IsString } from 'class-validator';

export class OidArrayDto {
  /** OID 列表 */
  @IsArray()
  @IsString({ each: true })
  oids: string[];
}
