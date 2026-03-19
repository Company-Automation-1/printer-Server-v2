import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AppConfigModule } from './config/app.module';
import { SharedModule } from './shared/shared.module';
import { PrinterModule } from './printer/printer.module';
import { OtaModule } from './ota/ota.module';
import { DbConfigModule } from './config/db.module';
import { RedisModule } from './config/redis.module';
import { MiddlewaresModule } from './middlewares/middlewares.module';
import { BaseModule } from './base/base.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    AppConfigModule,
    MiddlewaresModule,
    BaseModule,
    RedisModule,
    SharedModule,
    PrinterModule,
    OtaModule,
    DbConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
