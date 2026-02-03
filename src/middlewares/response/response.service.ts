import { Injectable, HttpStatus } from '@nestjs/common';
import { ResponseUtil } from './response.util';
import { FormattedResponse, FORMATTED_KEY } from './types';

@Injectable()
export class ResponseService {
  /**
   * 业务层调用的成功方法
   * 返回带标识符的格式化响应，告诉拦截器已经格式化过了
   */
  success<T>(data?: T, message = 'success', code = 200): FormattedResponse<T> {
    const result: FormattedResponse<T> = {
      ...ResponseUtil.success(data, message, code),
      [FORMATTED_KEY]: true,
    };
    return result;
  }

  /**
   * 业务层调用的错误方法
   */
  error(
    message = 'Internal server error',
    code = HttpStatus.INTERNAL_SERVER_ERROR,
  ): FormattedResponse<null> {
    return {
      ...ResponseUtil.error(message, code),
      [FORMATTED_KEY]: true,
    };
  }
}
