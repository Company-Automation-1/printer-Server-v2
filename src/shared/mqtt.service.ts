import {
  Injectable,
  Inject,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  MqttClient,
  IClientPublishOptions,
  IClientSubscribeOptions,
} from 'mqtt';
import { AppLogger, type ScopedAppLogger } from './logger';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly log: ScopedAppLogger;

  constructor(
    @Inject('MQTT_CLIENT') private readonly client: MqttClient,
    appLogger: AppLogger,
  ) {
    this.log = appLogger.forContext(MqttService.name);
  }

  publish(
    topic: string,
    message: string | Buffer,
    options?: IClientPublishOptions,
  ): void {
    this.client.publish(topic, message, options);
  }

  subscribe(topic: string | string[], options?: IClientSubscribeOptions): void {
    this.client.subscribe(topic, options);
  }

  unsubscribe(topic: string | string[]): void {
    this.client.unsubscribe(topic);
  }

  on(
    event: 'message',
    callback: (topic: string, message: Buffer) => void,
  ): void;
  on(event: 'connect' | 'disconnect' | 'error', callback: () => void): void;
  on(event: string, callback: (...args: any[]) => void): void {
    this.client.on(event as any, callback as any);
  }

  once(
    event: 'message',
    callback: (topic: string, message: Buffer) => void,
  ): void;
  once(event: 'connect' | 'disconnect' | 'error', callback: () => void): void;
  once(event: string, callback: (...args: any[]) => void): void {
    this.client.once(event as any, callback as any);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    this.client.off(event as any, callback as any);
  }

  get connected(): boolean {
    return this.client.connected;
  }

  // 当宿主模块的依赖项已解析完成时调用
  onModuleInit(): void {
    this.client.on('connect', () => {
      this.log.log(
        `MQTT connected to broker (clientId: ${this.client.options.clientId})`,
      );
    });

    this.client.on('disconnect', () => {
      this.log.warn('MQTT 断开连接');
    });

    this.client.on('error', (error: Error) => {
      this.log.error(`MQTT 错误: ${error.message}`, error.stack);
    });

    this.client.on('reconnect', () => {
      this.log.log('MQTT 重连中...');
    });

    this.client.on('offline', () => {
      this.log.warn('MQTT 离线');
    });
  }

  // 在接收到终止信号（例如 SIGTERM）后调用
  onModuleDestroy(): void {
    this.client.end();
    this.log.log('MQTT 连接关闭');
  }
}
