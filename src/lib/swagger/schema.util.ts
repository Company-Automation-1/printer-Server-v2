import { getSchemaPath } from '@nestjs/swagger';
import { ApiResponseDto } from '../../middlewares/response/api-response.dto';

type SchemaObject = Record<string, unknown>;

/** 生成 $ref 引用 schema */
export function ref(cls: new (...args: unknown[]) => unknown): SchemaObject {
  return { $ref: getSchemaPath(cls) };
}

/** 生成 array 类型 schema，items 为类引用 */
export function arrayRef(
  cls: new (...args: unknown[]) => unknown,
): SchemaObject {
  return { type: 'array', items: ref(cls) };
}

/** 生成 ApiResponse 的 schema 对象，供 @ApiResponse 使用 */
export function apiResponseSchema(
  dataSchema: SchemaObject | (new (...args: unknown[]) => unknown),
  options?: { status?: number; description?: string },
): { status: number; description: string; schema: SchemaObject } {
  const data = typeof dataSchema === 'function' ? ref(dataSchema) : dataSchema;
  return {
    status: 200,
    description: '成功',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data } },
      ],
    },
    ...options,
  };
}

/** 常用 data schema 预设 */
export const dataSchema = {
  /** data 为 null/object，无具体结构 */
  nullable: { type: 'object', nullable: true } as SchemaObject,
  /** data 为 boolean */
  boolean: (example = true) => ({ type: 'boolean', example }) as SchemaObject,
  /** data 为 string */
  string: (example = '') => ({ type: 'string', example }) as SchemaObject,
  /** data 为通用 object 数组 */
  objectArray: { type: 'array', items: { type: 'object' } } as SchemaObject,
};
