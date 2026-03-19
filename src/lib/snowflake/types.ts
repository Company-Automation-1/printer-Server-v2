/** 雪花算法：1bit符号 + 41bit时间戳 + 10bit机器ID + 12bit序列号 */

export const EPOCH = 1609459200000; // 2021-01-01 00:00:00 UTC
export const WORKER_BITS = 10;
export const SEQUENCE_BITS = 12;
export const MAX_SEQUENCE = (1 << SEQUENCE_BITS) - 1;
export const MAX_WORKER_ID = (1 << WORKER_BITS) - 1;

export interface SnowflakeOptions {
  /** 机器/节点 ID，0-1023 */
  workerId?: number;
  /** 起始时间戳(ms)，默认 2021-01-01 */
  epoch?: number;
}
