import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class MonthlyQueryDto {
  /** 年 */
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  /** 月 1-12 */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  /** 打印机 MAC，不传则查全部 */
  @IsOptional()
  @IsString()
  printerId?: string;

  /** true 时返回快照，默认返回增量 */
  @IsOptional()
  @Transform(({ obj, key }: { obj: Record<string, unknown>; key: string }) => {
    const v = obj[key];
    return v === 'true' || v === true || v === 1 || v === '1';
  })
  @IsBoolean()
  snapshot?: boolean;

  /** 仅 printerId 时有效，历史条数，默认 12 */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
