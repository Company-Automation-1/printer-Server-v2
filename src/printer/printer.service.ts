import {
  Injectable,
  OnModuleInit,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { matchTopic } from '../lib';
import { MqttService } from '../shared/mqtt.service';
import { SseGatewayService } from '../shared/sse-gateway.service';
import { PrinterRepository } from '../repositories';
import { LockPrinterDto, UnlockPrinterDto } from './dto';
import { PrinterDataPayload, PrinterInitPayload } from './topic.payload.type';

@Injectable()
export class PrinterService implements OnModuleInit {
  private readonly logger = new Logger(PrinterService.name);

  constructor(
    private readonly mqttService: MqttService,
    private readonly sseGatewayService: SseGatewayService,
    private readonly printerRepository: PrinterRepository,
  ) {}

  lockPrinter(lockPrinterDto: LockPrinterDto) {
    const { printerId } = lockPrinterDto;
    this.mqttService.publish(`server/${printerId}/lock`, 'lock');
  }

  unlockPrinter(unlockPrinterDto: UnlockPrinterDto) {
    const { printerId } = unlockPrinterDto;
    this.mqttService.publish(`server/${printerId}/lock`, 'unlock');
  }

  async getPrinterCounters(pid: string) {
    const printerId = pid.replace(/-/g, ':');
    const printer = await this.printerRepository.findByPrinterId(printerId);
    if (!printer) throw new NotFoundException('打印机不存在');
    // return { printer_id: printer.printerId, ...printer };
    return printer;
  }

  /**
   * 将topic转换为mac地址
   * @param topic - 消息的topic
   * @param index - 需要获取的索引 从0开始
   * @returns 转换后的mac地址
   */
  private TopicToMac(topic: string, index: number): string {
    return topic.split('/')[index]?.trim() ?? '';
  }

  private readonly topicHandlers: Array<{
    pattern: string;
    /**
     * @param topic - 消息的topic
     * @param message - 消息的payload
     */
    handle: (topic: string, message: Buffer) => void | Promise<void>;
  }> = [
    {
      pattern: 'printer/+/init', // 初始化打印机
      handle: (t, m) => this.handleInit(t, m),
    },
    {
      pattern: 'printer/+/status', // 打印机状态
      handle: (t, m) => this.handleStatus(t, m),
    },
    {
      pattern: 'printer/+/data', // 打印机数据
      handle: (t, m) => this.handleData(t, m),
    },
    {
      pattern: 'printer/+/lock', // 打印机锁定
      handle: (t, m) => this.handleLock(t, m),
    },
  ];

  private handleInit(topic: string, message: Buffer) {
    const mac = this.TopicToMac(topic, 1);
    const data = JSON.parse(message.toString()) as PrinterInitPayload;
    console.log(`[${mac}] ${JSON.stringify(data)}`);
  }

  private handleStatus(topic: string, message: Buffer) {
    const mac = this.TopicToMac(topic, 1);
    const status = message.toString().trim();
    if (status === 'online') {
      console.log(`${mac} 打印机在线`);
    } else if (status === 'offline') {
      console.log(`${mac} 打印机离线`);
    }
  }

  private async handleData(topic: string, message: Buffer) {
    const data = JSON.parse(message.toString()) as PrinterDataPayload;
    const mac = this.TopicToMac(topic, 1);
    await this.printerRepository.upsert(
      {
        printerId: data.mac,
        serial: data.serial,
        s_total: data.st,
        bw_cp: data.bw_copies,
        bw_p: data.bw_prints,
        c_cp: data.col_copies,
        c_p: data.col_prints,
      },
      ['printerId'],
    );
    // this.logger.debug(`[${data.mac}] data saved`);
    console.log(`[${mac}] ${JSON.stringify(data)}`);
  }

  private handleLock(topic: string, message: Buffer) {
    const mac = this.TopicToMac(topic, 1);
    console.log(mac);
    console.log(message.toString());
  }

  private broadcastToSse(topic: string, message: Buffer) {
    const data = {
      topic,
      message: message.toString(),
      timestamp: new Date().toISOString(),
    };
    this.sseGatewayService.broadcast('mqtt-message', data, 'printer');
  }

  onModuleInit() {
    const topics = this.topicHandlers.map((h) => h.pattern);
    const subscribe = () => {
      this.mqttService.subscribe(topics);
      this.logger.log(`Subscribed to MQTT topics: ${topics.join(', ')}`);
    };

    if (this.mqttService.connected) subscribe();
    else this.mqttService.once('connect', subscribe);

    this.mqttService.on('message', (topic: string, message: Buffer) => {
      try {
        const handler = this.topicHandlers.find((h) =>
          matchTopic(h.pattern, topic),
        );
        if (handler) void handler.handle(topic, message);
      } catch (error) {
        this.logger.error(
          `Failed to process MQTT message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    });
  }
}
