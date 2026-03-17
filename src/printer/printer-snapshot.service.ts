import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

const SNAPSHOT_SQL_ALL = `
INSERT INTO pre_printer_monthly (
  printer_id,
  serial,
  year,
  month,
  s_total,
  bw_cp,
  bw_p,
  c_cp,
  c_p,
  t_bk,
  t_cy,
  t_rd,
  t_yl,
  created_at
)
SELECT
  printer_id,
  serial,
  ?,
  ?,
  s_total,
  bw_cp,
  bw_p,
  c_cp,
  c_p,
  t_bk,
  t_cy,
  t_rd,
  t_yl,
  UNIX_TIMESTAMP()
FROM
  pre_printer
WHERE
  printer_id IS NOT NULL
ON DUPLICATE KEY UPDATE
  serial = VALUES(serial),
  s_total = VALUES(s_total),
  bw_cp = VALUES(bw_cp),
  bw_p = VALUES(bw_p),
  c_cp = VALUES(c_p),
  c_p = VALUES(c_p),
  t_bk = VALUES(t_bk),
  t_cy = VALUES(t_cy),
  t_rd = VALUES(t_rd),
  t_yl = VALUES(t_yl),
  created_at = VALUES(created_at)
`;

const SNAPSHOT_SQL_ONE = `
INSERT INTO pre_printer_monthly (
  printer_id,
  serial,
  year,
  month,
  s_total,
  bw_cp,
  bw_p,
  c_cp,
  c_p,
  t_bk,
  t_cy,
  t_rd,
  t_yl,
  created_at
)
SELECT
  printer_id,
  serial,
  ?,
  ?,
  s_total,
  bw_cp,
  bw_p,
  c_cp,
  c_p,
  t_bk,
  t_cy,
  t_rd,
  t_yl,
  UNIX_TIMESTAMP()
FROM
  pre_printer
WHERE
  printer_id = ?
ON DUPLICATE KEY UPDATE
  serial = VALUES(serial),
  s_total = VALUES(s_total),
  bw_cp = VALUES(bw_cp),
  bw_p = VALUES(bw_p),
  c_cp = VALUES(c_cp),
  c_p = VALUES(c_p),
  t_bk = VALUES(t_bk),
  t_cy = VALUES(t_cy),
  t_rd = VALUES(t_rd),
  t_yl = VALUES(t_yl),
  created_at = VALUES(created_at)
`;

@Injectable()
export class PrinterSnapshotService {
  private readonly logger = new Logger(PrinterSnapshotService.name);

  constructor(private readonly dataSource: DataSource) {}

  /** 每月 1 号 00:05 执行，截取上月月末快照 */
  @Cron('5 0 1 * *')
  async snapshotLastMonth() {
    const { year, month } = this.getLastMonth();
    await this.snapshotByMonth(year, month);
  }

  /** 按指定年月截取快照，printerIds 指定设备列表（定时任务不传为全量） */
  async snapshotByMonth(year: number, month: number, printerIds?: string[]) {
    if (printerIds?.length) {
      const placeholders = printerIds.map(() => '?').join(',');
      const sql = SNAPSHOT_SQL_ONE.replace(
        'printer_id = ?',
        `printer_id IN (${placeholders})`,
      );
      await this.dataSource.query(sql, [year, month, ...printerIds]);
    } else {
      await this.dataSource.query(SNAPSHOT_SQL_ALL, [year, month]);
    }
    const countSql = printerIds?.length
      ? `SELECT COUNT(*) as cnt FROM pre_printer_monthly WHERE year = ? AND month = ? AND printer_id IN (${printerIds.map(() => '?').join(',')})`
      : 'SELECT COUNT(*) as cnt FROM pre_printer_monthly WHERE year = ? AND month = ?';
    const params = printerIds?.length
      ? [year, month, ...printerIds]
      : [year, month];
    const [{ cnt }] = await this.dataSource.query<[{ cnt: number }]>(
      countSql,
      params,
    );
    if (cnt === 0) {
      this.logger.log(`[${year}-${month}] 无设备数据，跳过`);
      return;
    }
    this.logger.log(`[${year}-${month}] 快照完成，${cnt} 台设备`);
  }

  private getLastMonth(): { year: number; month: number } {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  }
}
