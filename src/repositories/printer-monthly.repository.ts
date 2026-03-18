import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from './base.repositories';
import { PrinterMonthly } from '../entity/printer-monthly.entity';

/** 打印机月度快照数据访问 */
@Injectable()
export class PrinterMonthlyRepository extends BaseRepository<PrinterMonthly> {
  constructor(dataSource: DataSource) {
    super(PrinterMonthly, dataSource.createEntityManager());
  }

  findByYearMonth(
    year: number,
    month: number,
    printerId?: string,
  ): Promise<PrinterMonthly[]> {
    const where = { year, month, ...(printerId && { printerId }) };
    return this.find({
      where,
      order: { printerId: 'ASC' },
    });
  }

  findByPrinterIdHistory(
    printerId: string,
    opts?: { year?: number; month?: number; limit?: number },
  ): Promise<PrinterMonthly[]> {
    const qb = this.createQueryBuilder('m')
      .where('m.printerId = :printerId', { printerId })
      .orderBy('m.year', 'DESC')
      .addOrderBy('m.month', 'DESC')
      .take(opts?.limit ?? 12);
    if (opts?.year != null && opts?.month != null) {
      qb.andWhere('m.year = :year', { year: opts.year }).andWhere(
        'm.month = :month',
        { month: opts.month },
      );
    }
    return qb.getMany();
  }

  findLastMonth(year: number, month: number): Promise<PrinterMonthly[]> {
    const [lastYear, lastMonth] =
      month === 1 ? [year - 1, 12] : [year, month - 1];
    return this.find({ where: { year: lastYear, month: lastMonth } });
  }

  countByYearMonth(year: number, month: number): Promise<number> {
    return this.count({ where: { year, month } });
  }

  findAll(): Promise<PrinterMonthly[]> {
    return this.find({
      order: { year: 'DESC', month: 'DESC', printerId: 'ASC' },
    });
  }
}
