import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtaRepository } from './ota.repository';
import { PrinterRepository } from './printer.repository';
import { PrinterMonthlyRepository } from './printer-monthly.repository';
import { Ota } from '../entity/ota.entity';
import { Printer } from '../entity/printer.entity';
import { PrinterMonthly } from '../entity/printer-monthly.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ota, Printer, PrinterMonthly])],
  providers: [OtaRepository, PrinterRepository, PrinterMonthlyRepository],
  exports: [OtaRepository, PrinterRepository, PrinterMonthlyRepository],
})
export class RepositoriesModule {}
