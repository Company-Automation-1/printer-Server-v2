import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('pre_ota')
@Index(['key'])
export class Ota {
  /** OTA ID */
  @PrimaryGeneratedColumn()
  id: number;

  /** 版本号 */
  @Column({ unique: true })
  version: string;

  /** 存储键 */
  @Column()
  key: string;

  /** 文件URL */
  @Column()
  url: string;
}
