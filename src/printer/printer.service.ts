import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { MqttService } from '../shared/mqtt.service';
import { SseGatewayService } from '../shared/sse-gateway.service';
import { LockPrinterDto } from './dto';

@Injectable()
export class PrinterService implements OnModuleInit {
  private readonly logger = new Logger(PrinterService.name);

  constructor(
    private readonly mqttService: MqttService,
    private readonly sseGatewayService: SseGatewayService,
  ) {}

  // printer/data/{MAC}/lock，payload: lock/unlock
  lockPrinter(lockPrinterDto: LockPrinterDto) {
    const { printerId, status } = lockPrinterDto;
    this.mqttService.publish(`printer/data/${printerId}/lock`, status);
  }

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
}
