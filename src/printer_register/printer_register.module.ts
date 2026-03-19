import { Module } from '@nestjs/common';
import { PrinterRegisterService } from './printer_register.service';
import { PrinterRegisterController } from './printer_register.controller';
import { RepositoriesModule } from '../repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [PrinterRegisterController],
  providers: [PrinterRegisterService],
  exports: [PrinterRegisterService],
})
export class PrinterRegisterModule {}
