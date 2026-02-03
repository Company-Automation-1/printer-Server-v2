import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtaRepository } from './ota.repository';
import { Ota } from '../entity/ota.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ota])],
  providers: [OtaRepository],
  exports: [OtaRepository],
})
export class RepositoriesModule {}
