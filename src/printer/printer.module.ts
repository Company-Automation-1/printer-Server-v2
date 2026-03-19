import { Module } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { PrinterController } from './printer.controller';
import { PrinterSnapshotService } from './printer-snapshot.service';
import { PrinterMonthlyService } from './printer-monthly.service';
import { RepositoriesModule } from '../repositories/repositories.module';
import { PrinterRegisterModule } from '../printer_register/printer_register.module';

@Module({
  imports: [RepositoriesModule, PrinterRegisterModule],
  controllers: [PrinterController],
  providers: [PrinterService, PrinterSnapshotService, PrinterMonthlyService],
})
export class PrinterModule {}
