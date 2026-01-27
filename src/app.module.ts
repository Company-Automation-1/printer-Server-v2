import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import { PrinterModule } from './printer/printer.module';

@Module({
  imports: [ConfigModule.forRoot(), SharedModule, PrinterModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
