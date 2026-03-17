import { Module } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { PrinterController } from './printer.controller';
import { PrinterSnapshotService } from './printer-snapshot.service';
import { PrinterMonthlyService } from './printer-monthly.service';
import { RepositoriesModule } from '../repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [PrinterController],
  providers: [PrinterService, PrinterSnapshotService, PrinterMonthlyService],
})
export class PrinterModule {}
