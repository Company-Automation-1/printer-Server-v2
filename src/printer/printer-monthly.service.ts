import { BadRequestException, Injectable } from '@nestjs/common';
import { PrinterMonthlyRepository } from '../repositories';
import { PrinterSnapshotService } from './printer-snapshot.service';
import { PrinterMonthly } from '../entity/printer-monthly.entity';
import { MonthlyQueryDto } from './dto';

const NUM_FIELDS = [
  's_total',
  'bw_cp',
  'bw_p',
  'c_cp',
  'c_p',
  't_bk',
  't_cy',
  't_rd',
  't_yl',
] as const;

type DeltaRow = {
  printerId: string;
  serial: string | null;
  year: number;
  month: number;
  createdAt: number | null;
} & Record<`${(typeof NUM_FIELDS)[number]}_delta`, number | null>;

@Injectable()
export class PrinterMonthlyService {
  constructor(
    private readonly printerMonthlyRepository: PrinterMonthlyRepository,
    private readonly printerSnapshotService: PrinterSnapshotService,
  ) {}

  async findMonthly(dto: MonthlyQueryDto) {
    const { year, month, printerId, snapshot = false, limit = 12 } = dto;
    if (printerId) {
      return this.findByPrinterId(printerId, year, month, limit, snapshot);
    }
    if (year != null && month != null) {
      return this.findByYearMonth(year, month, printerId, snapshot);
    }
    if (year == null && month == null) {
      return this.findAll(snapshot);
    }
    throw new BadRequestException('需传 year+month 或 printerId 或 不传参数');
  }

  private async findAll(snapshot: boolean) {
    const rows = await this.printerMonthlyRepository.findAll();
    if (snapshot) return rows;
    return this.toDeltaBatch(rows);
  }

  private async findByYearMonth(
    year: number,
    month: number,
    printerId?: string,
    snapshot = false,
  ) {
    const rows = await this.printerMonthlyRepository.findByYearMonth(
      year,
      month,
      printerId,
    );
    if (snapshot) return rows;
    const lastRows = await this.printerMonthlyRepository.findLastMonth(
      year,
      month,
    );
    return this.toDelta(rows, lastRows);
  }

  private async findByPrinterId(
    printerId: string,
    year?: number,
    month?: number,
    limit = 12,
    snapshot = false,
  ) {
    const rows = await this.printerMonthlyRepository.findByPrinterIdHistory(
      printerId,
      { year, month, limit },
    );
    if (snapshot) return rows;
    if (year != null && month != null && rows.length > 0) {
      const lastRows = await this.printerMonthlyRepository.findLastMonth(
        year,
        month,
      );
      return this.toDelta(rows, lastRows);
    }
    return this.toDeltaBatch(rows);
  }

  private toDelta(
    current: PrinterMonthly[],
    lastRows: PrinterMonthly[],
  ): DeltaRow[] {
    const lastMap = new Map(lastRows.map((r) => [r.printerId, r]));
    return current.map((cur) =>
      this.calcDelta(cur, lastMap.get(cur.printerId)),
    );
  }

  private toDeltaBatch(rows: PrinterMonthly[]): DeltaRow[] {
    const map = new Map(rows.map((r) => [`${r.year}-${r.month}`, r]));
    return rows.map((cur) => {
      const [py, pm] =
        cur.month === 1 ? [cur.year - 1, 12] : [cur.year, cur.month - 1];
      const last = map.get(`${py}-${pm}`);
      return this.calcDelta(cur, last);
    });
  }

  private calcDelta(cur: PrinterMonthly, last?: PrinterMonthly): DeltaRow {
    const row = {
      printerId: cur.printerId,
      serial: cur.serial,
      year: cur.year,
      month: cur.month,
      createdAt: cur.createdAt,
    } as DeltaRow;
    for (const f of NUM_FIELDS) {
      const curVal = cur[f] ?? 0;
      const lastVal = last?.[f] ?? 0;
      row[`${f}_delta`] = curVal - lastVal;
    }
    return row;
  }

  /** 指定设备补录上月，累计数据无法回溯历史 */
  async triggerSnapshot(printerIds: string[]) {
    const { year, month } = this.getLastMonth();
    await this.printerSnapshotService.snapshotByMonth(year, month, printerIds);
    const count = await this.printerMonthlyRepository
      .createQueryBuilder('m')
      .where('m.year = :year', { year })
      .andWhere('m.month = :month', { month })
      .andWhere('m.printerId IN (:...printerIds)', { printerIds })
      .getCount();
    return { year, month, printerIds, count };
  }

  private getLastMonth(): { year: number; month: number } {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  }
}
