import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtaRepository } from './ota.repository';
import { PrinterRepository } from './printer.repository';
import { PrinterMonthlyRepository } from './printer-monthly.repository';
import { PrinterRegisterRepository } from './printer-register.repository';
import { Ota } from '../entity/ota.entity';
import { Printer } from '../entity/printer.entity';
import { PrinterMonthly } from '../entity/printer-monthly.entity';
import { PrinterRegister } from '../entity/printer-register.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ota, Printer, PrinterMonthly, PrinterRegister]),
  ],
  providers: [
    OtaRepository,
    PrinterRepository,
    PrinterMonthlyRepository,
    PrinterRegisterRepository,
  ],
  exports: [
    OtaRepository,
    PrinterRepository,
    PrinterMonthlyRepository,
    PrinterRegisterRepository,
  ],
})
export class RepositoriesModule {}
