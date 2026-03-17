import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class SnapshotDto {
  /** 打印机 MAC 列表，单设备或多设备补录 */
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  printerId: string[];
}
