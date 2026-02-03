import { Module, Global } from '@nestjs/common';
import { ResponseService } from './response';

@Global()
@Module({
  providers: [ResponseService],
  exports: [ResponseService],
})
export class MiddlewaresModule {}
