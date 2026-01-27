import { Module, Global } from '@nestjs/common';
import { StorageModule } from './storage/storage.module';
import { MqttModule } from '../config/mqtt.module';
import { MqttService } from './mqtt.service';
import { SseGatewayService } from './sse-gateway.service';

@Global()
@Module({
  imports: [MqttModule, StorageModule],
  providers: [MqttService, SseGatewayService],
  exports: [MqttService, SseGatewayService, StorageModule],
})
export class SharedModule {}
