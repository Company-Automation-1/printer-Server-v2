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
import {
  SERVER_LOCK,
  SERVER_REGISTER_STATUS,
  SERVER_OID,
  SERVER_OID_MAC,
  PRINTER_INIT,
  PRINTER_STATUS,
  PRINTER_DATA,
  PRINTER_LOCK,
  PRINTER_REGISTER,
  PRINTER_OID,
} from './mqtt-topic';
import { SseGatewayService } from '../shared/sse-gateway.service';
import { PrinterRepository } from '../repositories';
import { PrinterRegisterService } from '../printer_register/printer_register.service';
import { LockPrinterDto, UnlockPrinterDto, OidCallbackDto } from './dto';
import {
  PrinterDataPayload,
  PrinterInitPayload,
  PrinterRegisterPayload,
} from './topic.payload.type';

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
    private readonly printerRegisterService: PrinterRegisterService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  lockPrinter(lockPrinterDto: LockPrinterDto) {
    this.mqttService.publish(SERVER_LOCK(lockPrinterDto.printerId), 'lock', {
      retain: true,
    });
  }

  unlockPrinter(unlockPrinterDto: UnlockPrinterDto) {
    this.mqttService.publish(
      SERVER_LOCK(unlockPrinterDto.printerId),
      'unlock',
      { retain: true },
    );
  }

  async publishOid(dto: OidCallbackDto): Promise<string> {
    return this.publishOidInternal(dto, { mode: 'broadcast' });
  }

  async publishOidByMac(oid: string, dto: OidCallbackDto): Promise<string> {
    return this.publishOidInternal(dto, {
      mode: 'single',
      mac: oid.replace(/-/g, ':'),
    });
  }

  private async publishOidInternal(
    dto: OidCallbackDto,
    opts: { mode: 'broadcast' } | { mode: 'single'; mac: string },
  ): Promise<string> {
    const requestId = dto.requestId ?? randomUUID();
    const record: OidCallbackRecord = {
      callback: dto.callback,
      mode: opts.mode,
      ...(opts.mode === 'broadcast' && { calledMacs: [] }),
    };
    await this.cache.set(
      `${OID_CALLBACK_PREFIX}${requestId}`,
      record,
      OID_CALLBACK_TTL,
    );
    const topic =
      opts.mode === 'broadcast' ? SERVER_OID : SERVER_OID_MAC(opts.mac);
    this.mqttService.publish(
      topic,
      JSON.stringify({ requestId, oids: dto.oids }),
    );
    return requestId;
  }

  async getAllPrinters() {
    return this.printerRepository.find({ order: { printerId: 'ASC' } });
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
    { pattern: PRINTER_INIT, handle: (t, m) => this.handleInit(t, m) }, // 打印机初始化
    { pattern: PRINTER_STATUS, handle: (t, m) => this.handleStatus(t, m) }, // 打印机状态
    { pattern: PRINTER_DATA, handle: (t, m) => this.handleData(t, m) }, // 打印机数据
    { pattern: PRINTER_LOCK, handle: (t, m) => this.handleLock(t, m) }, // 打印机锁定
    { pattern: PRINTER_REGISTER, handle: (t, m) => this.handleRegister(t, m) }, // 注册页 URL
    { pattern: PRINTER_OID, handle: (t, m) => this.handleOid(t, m) }, // 按需 OID 查询结果
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

  private async handleRegister(topic: string, message: Buffer) {
    const mac = this.TopicToMac(topic, 1);
    const data = JSON.parse(message.toString()) as PrinterRegisterPayload;
    try {
      await this.printerRegisterService.upsertByPrinterId(
        mac,
        data.ip,
        data.serial,
      );
      const record = await this.printerRegisterService.findByPrinterId(mac);
      const registered = !!record?.identifier;
      this.mqttService.publish(
        SERVER_REGISTER_STATUS(mac),
        JSON.stringify({ registered }),
      );
    } catch (err) {
      this.logger.warn(
        `[${mac}] 注册失败: ${err instanceof Error ? err.message : err}`,
      );
    }
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
