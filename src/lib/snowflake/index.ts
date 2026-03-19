export { Snowflake } from './generator';
export type { SnowflakeOptions } from './types';

import { Snowflake } from './generator';

const defaultSnowflake = new Snowflake({ workerId: 1 });

/** 生成雪花 ID 字符串 */
export function generateSnowflakeId(): string {
  return defaultSnowflake.generate();
}
