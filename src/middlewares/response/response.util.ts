import { HttpException, HttpStatus } from '@nestjs/common';
import { Response } from './types';

export class ResponseUtil {
  static success<T>(data?: T, message = 'success', code = 200): Response<T> {
    const result = {
      success: true,
      code,
      message,
      data,
      timestamp: Math.floor(Date.now() / 1000),
    };
    return result;
  }

  static error(
    message = 'Internal server error',
    code = HttpStatus.INTERNAL_SERVER_ERROR,
  ): Response<null> {
    return {
      success: false,
      code,
      message,
      timestamp: Math.floor(Date.now() / 1000),
    };
  }

  static fromException(exception: unknown): Response<null> {
    const httpException =
      exception instanceof HttpException
        ? exception
        : new HttpException(
            exception instanceof Error
              ? exception.message
              : 'Internal server error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );

    const status = httpException.getStatus();
    const response = httpException.getResponse();
    const message =
      typeof response === 'string'
        ? response
        : (response as { message?: string }).message || 'Internal server error';

    return this.error(message, status);
  }
}
