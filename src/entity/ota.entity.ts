import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('pre_ota')
@Index(['key'])
export class Ota {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'OTA ID' })
  id: number;

  @Column({ unique: true })
  @ApiProperty({ description: '版本号' })
  version: string;

  @Column()
  @ApiProperty({ description: '存储键' })
  key: string;

  @Column()
  @ApiProperty({ description: '文件URL' })
  url: string;
}
