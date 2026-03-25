import { Module, Global } from '@nestjs/common';
import { StorageModule } from './storage/storage.module';
import { MqttModule } from '../config/mqtt.module';
import { MqttService } from './mqtt.service';
import { SseGatewayService } from './sse-gateway.service';
import { LoggerModule } from './logger';

@Global()
@Module({
  imports: [LoggerModule, MqttModule, StorageModule],
  providers: [MqttService, SseGatewayService],
  exports: [MqttService, SseGatewayService, StorageModule, LoggerModule],
})
export class SharedModule {}
