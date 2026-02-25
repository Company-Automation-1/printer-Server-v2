import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ResponseService } from './response';
import { MqttProxyMiddleware } from './mqtt-proxy.middleware';
import { ApiKeyGuard } from './api-key';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    ResponseService,
    MqttProxyMiddleware,
    { provide: APP_GUARD, useClass: ApiKeyGuard },
  ],
  exports: [ResponseService],
})
export class MiddlewaresModule {}
