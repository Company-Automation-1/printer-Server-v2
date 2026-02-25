import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from './base.repositories';
import { Printer } from '../entity/printer.entity';

@Injectable()
export class PrinterRepository extends BaseRepository<Printer> {
  constructor(dataSource: DataSource) {
    super(Printer, dataSource.createEntityManager());
  }

  async findByPrinterId(printerId: string): Promise<Printer | null> {
    return this.findOne({ where: { printerId } });
  }
}
