import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

/** 打印机月度快照：按月截取累计数据，用于月增量统计 */
@Entity('pre_printer_monthly')
@Index('uk_printer_year_month', ['printerId', 'year', 'month'], {
  unique: true,
})
@Index('idx_year_month', ['year', 'month'])
export class PrinterMonthly {
  /** 主键 */
  @PrimaryGeneratedColumn()
  id: number;

  /** 打印机 MAC */
  @Column({
    name: 'printer_id',
    type: 'char',
    length: 30,
    comment: '打印机 MAC',
  })
  printerId: string;

  /** 序列号 */
  @Column({ type: 'char', length: 50, nullable: true, comment: '序列号' })
  serial: string | null;

  /** 年 */
  @Column({ type: 'smallint', comment: '年' })
  year: number;

  /** 月 1-12 */
  @Column({ type: 'tinyint', comment: '月 1-12' })
  month: number;

  /** 总打印+复印数(月末累计) */
  @Column({ type: 'int', nullable: true, comment: '总打印+复印数(月末累计)' })
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

  /** 黑色碳粉余量 */
  @Column({ type: 'int', nullable: true, comment: '黑色碳粉余量' })
  t_bk: number | null;

  /** 青色碳粉余量 */
  @Column({ type: 'int', nullable: true, comment: '青色碳粉余量' })
  t_cy: number | null;

  /** 红色碳粉余量 */
  @Column({ type: 'int', nullable: true, comment: '红色碳粉余量' })
  t_rd: number | null;

  /** 黄色碳粉余量 */
  @Column({ type: 'int', nullable: true, comment: '黄色碳粉余量' })
  t_yl: number | null;

  /** 快照创建时间，秒级时间戳 */
  @Column({
    name: 'created_at',
    type: 'bigint',
    nullable: true,
    comment: '秒级时间戳',
    transformer: { from: (v: string | number) => +v, to: (v: number) => v },
  })
  createdAt: number | null;
}
