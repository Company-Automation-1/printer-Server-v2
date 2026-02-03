import { Module } from '@nestjs/common';
import { OtaService } from './ota.service';
import { OtaController } from './ota.controller';
import { RepositoriesModule } from '../repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [OtaController],
  providers: [OtaService],
})
export class OtaModule {}
