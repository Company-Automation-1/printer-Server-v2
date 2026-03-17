import {
  Injectable,
  OnModuleInit,
  Logger,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { matchTopic } from '../lib';
import { MqttService } from '../shared/mqtt.service';
import { SseGatewayService } from '../shared/sse-gateway.service';
import { PrinterRepository } from '../repositories';
import { LockPrinterDto, UnlockPrinterDto, OidCallbackDto } from './dto';
import { PrinterDataPayload, PrinterInitPayload } from './topic.payload.type';

const OID_CALLBACK_TTL = 30_000; // 30s
const OID_CALLBACK_PREFIX = 'oid:callback:';

interface OidCallbackRecord {
  callback: string;
  mode: 'broadcast' | 'single';
  calledMacs?: string[];
}

@Injectable()
export class PrinterService implements OnModuleInit {
  private readonly logger = new Logger(PrinterService.name);

  constructor(
    private readonly mqttService: MqttService,
    private readonly sseGatewayService: SseGatewayService,
    private readonly printerRepository: PrinterRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  lockPrinter(lockPrinterDto: LockPrinterDto) {
    const { printerId } = lockPrinterDto;
    this.mqttService.publish(`server/${printerId}/lock`, 'lock');
  }

  unlockPrinter(unlockPrinterDto: UnlockPrinterDto) {
    const { printerId } = unlockPrinterDto;
    this.mqttService.publish(`server/${printerId}/lock`, 'unlock');
  }

  async publishOid(dto: OidCallbackDto): Promise<string> {
    const requestId = dto.requestId ?? randomUUID();
    const record: OidCallbackRecord = {
      callback: dto.callback,
      mode: 'broadcast',
      calledMacs: [],
    };
    await this.cache.set(
      `${OID_CALLBACK_PREFIX}${requestId}`,
      record,
      OID_CALLBACK_TTL,
    );
    this.mqttService.publish(
      'server/oid',
      JSON.stringify({ requestId, oids: dto.oids }),
    );
    return requestId;
  }

  async publishOidByMac(oid: string, dto: OidCallbackDto): Promise<string> {
    const requestId = dto.requestId ?? randomUUID();
    const mac = oid.replace(/-/g, ':');
    const record: OidCallbackRecord = {
      callback: dto.callback,
      mode: 'single',
    };
    await this.cache.set(
      `${OID_CALLBACK_PREFIX}${requestId}`,
      record,
      OID_CALLBACK_TTL,
    );
    this.mqttService.publish(
      `server/oid/${mac}`,
      JSON.stringify({ requestId, oids: dto.oids }),
    );
    return requestId;
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
    {
      pattern: 'printer/+/web', // Web 配置页 URL
      handle: (t, m) => this.handleWeb(t, m),
    },
    {
      pattern: 'printer/oid/+', // 按需 OID 查询结果
      handle: (t, m) => this.handleOid(t, m),
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
        t_bk: data.toner_black ?? null,
        t_cy: data.toner_cyan ?? null,
        t_rd: data.toner_red ?? null,
        t_yl: data.toner_yellow ?? null,
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

  private handleWeb(topic: string, message: Buffer) {
    const mac = this.TopicToMac(topic, 1);
    const url = message.toString().trim();
    console.log(`[${mac}] Web: ${url}`);
  }

  private async handleOid(topic: string, message: Buffer) {
    const mac = this.TopicToMac(topic, 2);
    const raw = JSON.parse(message.toString()) as {
      requestId?: string;
      results?: Record<string, string>;
    };
    const requestId = raw.requestId;
    const oidResults = (raw.results ?? raw) as Record<string, string>;

    if (!requestId) {
      this.logger.debug(`[${mac}] OID 无 requestId，跳过回调`);
      return;
    }

    const key = `${OID_CALLBACK_PREFIX}${requestId}`;
    const record = await this.cache.get<OidCallbackRecord>(key);
    if (!record?.callback) {
      this.logger.debug(`[${mac}] OID requestId=${requestId} 已过期或不存在`);
      return;
    }

    const calledMacs: string[] = Array.isArray(record.calledMacs)
      ? record.calledMacs
      : [];
    if (record.mode === 'broadcast') {
      if (calledMacs.includes(mac)) return;
      record.calledMacs = [...calledMacs, mac];
      await this.cache.set(key, record, OID_CALLBACK_TTL);
    } else {
      await this.cache.del(key);
    }

    const payload = {
      requestId,
      mac,
      oidResults,
      timestamp: Math.floor(Date.now() / 1000),
    };
    try {
      await axios.post(record.callback, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10_000,
      });
    } catch (err) {
      this.logger.warn(
        `OID 回调失败 requestId=${requestId} mac=${mac}: ${err instanceof Error ? err.message : err}`,
      );
    }
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
