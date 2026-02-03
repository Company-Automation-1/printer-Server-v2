// 格式化响应的标识符（使用字符串属性，避免 Symbol 在传递过程中丢失）
export const FORMATTED_KEY = '__formatted__';

// 标准响应接口（最终返回给客户端）
export interface Response<T> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

// 带标识符的响应接口（业务层返回）
export interface FormattedResponse<T> extends Response<T> {
  [FORMATTED_KEY]: true;
}
