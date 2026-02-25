import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('pre_printer')
@Index('idx_printer_id', ['printerId'], { unique: true })
@Index('idx_serial', ['serial'], { unique: true })
export class Printer {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '主键' })
  id: number;

  @Column({
    name: 'printer_id',
    type: 'char',
    length: 30,
    nullable: true,
    comment: '打印机id(硬件 MAC 地址)',
  })
  @ApiProperty({ description: '打印机ID(MAC)' })
  printerId: string | null;

  @Column({ type: 'char', length: 50, nullable: true, comment: '打印机序列号' })
  @ApiProperty({ description: '序列号' })
  serial: string | null;

  @Column({ type: 'int', nullable: true, comment: '总打印+复印数' })
  s_total: number | null;

  @Column({ type: 'int', nullable: true, comment: '黑白复印' })
  bw_cp: number | null;

  @Column({ type: 'int', nullable: true, comment: '黑白打印' })
  bw_p: number | null;

  @Column({ type: 'int', nullable: true, comment: '彩色复印' })
  c_cp: number | null;

  @Column({ type: 'int', nullable: true, comment: '彩色打印' })
  c_p: number | null;
}
