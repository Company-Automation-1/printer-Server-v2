import {
  EPOCH,
  MAX_SEQUENCE,
  MAX_WORKER_ID,
  WORKER_BITS,
  SEQUENCE_BITS,
  type SnowflakeOptions,
} from './types';

export class Snowflake {
  private readonly workerId: number;
  private readonly epoch: number;
  private sequence = 0;
  private lastTimestamp = 0;

  constructor(options: SnowflakeOptions = {}) {
    const workerId = options.workerId ?? 1;
    if (workerId < 0 || workerId > MAX_WORKER_ID) {
      throw new RangeError(`workerId must be 0-${MAX_WORKER_ID}`);
    }
    this.workerId = workerId;
    this.epoch = options.epoch ?? EPOCH;
  }

  /** 生成雪花 ID，返回十进制字符串 */
  generate(): string {
    let timestamp = Date.now();
    if (timestamp < this.lastTimestamp) {
      throw new Error('Clock moved backwards, refusing to generate id');
    }
    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & MAX_SEQUENCE;
      if (this.sequence === 0) {
        while (Date.now() <= timestamp) void 0;
        timestamp = Date.now();
      }
    } else {
      this.sequence = 0;
    }
    this.lastTimestamp = timestamp;

    const id =
      (BigInt(timestamp - this.epoch) << BigInt(WORKER_BITS + SEQUENCE_BITS)) |
      (BigInt(this.workerId) << BigInt(SEQUENCE_BITS)) |
      BigInt(this.sequence);
    return id.toString();
  }
}
