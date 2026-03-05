import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('pre_printer')
@Index('idx_printer_id', ['printerId'], { unique: true })
@Index('idx_serial', ['serial'], { unique: true })
export class Printer {
  /** 主键 */
  @PrimaryGeneratedColumn()
  id: number;

  /** 打印机ID(MAC) */
  @Column({
    name: 'printer_id',
    type: 'char',
    length: 30,
    nullable: true,
    comment: '打印机id(硬件 MAC 地址)',
  })
  printerId: string | null;

  /** 序列号 */
  @Column({ type: 'char', length: 50, nullable: true, comment: '打印机序列号' })
  serial: string | null;

  /** 总打印+复印数 */
  @Column({ type: 'int', nullable: true, comment: '总打印+复印数' })
  s_total: number | null;

  /** 黑白复印数 */
  @Column({ type: 'int', nullable: true, comment: '黑白复印' })
  bw_cp: number | null;

  /** 黑白打印数 */
  @Column({ type: 'int', nullable: true, comment: '黑白打印' })
  bw_p: number | null;

  /** 彩色复印数 */
  @Column({ type: 'int', nullable: true, comment: '彩色复印' })
  c_cp: number | null;

  /** 彩色打印数 */
  @Column({ type: 'int', nullable: true, comment: '彩色打印' })
  c_p: number | null;
}
