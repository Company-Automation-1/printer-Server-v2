import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import { PrinterModule } from './printer/printer.module';
import { OtaModule } from './ota/ota.module';
import { DbConfigModule } from './config/db.module';
import { MiddlewaresModule } from './middlewares/middlewares.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MiddlewaresModule,
    SharedModule,
    PrinterModule,
    OtaModule,
    DbConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
