import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from './base.repositories';
import { PrinterRegister } from '../entity/printer-register.entity';

@Injectable()
export class PrinterRegisterRepository extends BaseRepository<PrinterRegister> {
  constructor(dataSource: DataSource) {
    super(PrinterRegister, dataSource.createEntityManager());
  }

  async findByUuid(uuid: string): Promise<PrinterRegister | null> {
    return this.findOne({ where: { uuid } });
  }

  async findById(id: number): Promise<PrinterRegister | null> {
    return this.findOne({ where: { id } });
  }
}
