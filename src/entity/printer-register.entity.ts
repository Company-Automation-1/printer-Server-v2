import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

/** 打印机注册表：MAC、序列号及注册二维码 */
@Entity('pre_printer_register')
@Index('idx_uuid', ['uuid'], { unique: true })
@Index('idx_identifier', ['identifier'], { unique: true })
export class PrinterRegister {
  /** 主键 */
  @PrimaryGeneratedColumn()
  id: number;

  /** 雪花ID */
  @Column({ type: 'bigint', comment: '雪花ID' })
  uuid: string;

  /** 标识 (可读唯一标识) */
  @ApiProperty({ nullable: true })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '标识 (可读唯一标识)',
  })
  identifier: string | null;

  /** 二维码存储键 */
  @Column({
    name: 'qr_key',
    type: 'varchar',
    length: 255,
    comment: '二维码存储键',
  })
  qrKey: string;

  /** 二维码访问 URL */
  @Column({
    name: 'qr_url',
    type: 'varchar',
    length: 255,
    comment: '二维码访问 URL',
  })
  qrUrl: string;

  /** 打印机id(硬件 MAC 地址) */
  @ApiProperty({ nullable: true })
  @Column({
    name: 'printer_id',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '打印机id(硬件 MAC 地址)',
  })
  printerId: string | null;

  /** 局域网IP */
  @ApiProperty({ nullable: true })
  @Column({
    name: 'lan_ip',
    type: 'varchar',
    length: 15,
    nullable: true,
    comment: '局域网IP',
  })
  lanIp: string | null;

  /** 打印机序列号 */
  @ApiProperty({ nullable: true })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '打印机序列号',
  })
  serial: string | null;

  /** 创建时间，秒级时间戳 */
  @ApiProperty({ nullable: true })
  @Column({
    name: 'created_at',
    type: 'bigint',
    nullable: true,
    comment: '创建时间',
    transformer: { from: (v: string | number) => +v, to: (v: number) => v },
  })
  createdAt: number | null;

  /** 更新时间，秒级时间戳 */
  @ApiProperty({ nullable: true })
  @Column({
    name: 'updated_at',
    type: 'bigint',
    nullable: true,
    comment: '更新时间',
    transformer: { from: (v: string | number) => +v, to: (v: number) => v },
  })
  updatedAt: number | null;
}
