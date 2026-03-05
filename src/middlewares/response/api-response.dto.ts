import { ApiHideProperty } from '@nestjs/swagger';

/** 统一响应结构（所有接口均包装为此格式） */
export class ApiResponseDto<T = unknown> {
  /** @example true */
  success: boolean;
  /** @example 200 */
  code: number;
  /** @example success */
  message: string;
  @ApiHideProperty()
  data?: T;
  /** @example 1700000000 */
  timestamp: number;
}
