import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { OtaUpdatePrinterDto } from './dto/publish-printer.dto';
import { MqttService } from 'src/shared/mqtt.service';
import { SseGatewayService } from 'src/shared/sse-gateway.service';

@Injectable()
export class PrinterService implements OnModuleInit {
  private readonly logger = new Logger(PrinterService.name);

  constructor(
    private readonly mqttService: MqttService,
    private readonly sseGatewayService: SseGatewayService,
  ) {}

  onModuleInit() {
    const subscribeToTopic = () => {
      this.mqttService.subscribe('printer/data/#');
      this.logger.log('Subscribed to MQTT topic: printer/data/#');
    };

    if (this.mqttService.connected) {
      subscribeToTopic();
    } else {
      this.mqttService.once('connect', subscribeToTopic);
    }

    this.mqttService.on('message', (topic: string, message: Buffer) => {
      try {
        const data = {
          topic,
          message: message.toString(),
          timestamp: new Date().toISOString(),
        };
        this.sseGatewayService.broadcast('mqtt-message', data, 'printer');
      } catch (error) {
        this.logger.error(
          `Failed to process MQTT message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    });
  }

  publishOtaUpdate(otaUpdatePrinterDto: OtaUpdatePrinterDto): void {
    const { printerId, version, url } = otaUpdatePrinterDto;

    const topic = printerId
      ? `printer/data/${printerId}/ota/update`
      : 'printer/ota/broadcast/update';

    this.mqttService.publish(topic, JSON.stringify({ version, url }));
  }
}
