import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtaRepository } from './ota.repository';
import { PrinterRepository } from './printer.repository';
import { Ota } from '../entity/ota.entity';
import { Printer } from '../entity/printer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ota, Printer])],
  providers: [OtaRepository, PrinterRepository],
  exports: [OtaRepository, PrinterRepository],
})
export class RepositoriesModule {}
