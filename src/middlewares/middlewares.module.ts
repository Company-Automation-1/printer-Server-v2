import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ResponseService } from './response';
import { MqttProxyMiddleware } from './mqtt-proxy.middleware';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [ResponseService, MqttProxyMiddleware],
  exports: [ResponseService],
})
export class MiddlewaresModule {}
