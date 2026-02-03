import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ResponseUtil } from './response.util';
import { Response, FormattedResponse, FORMATTED_KEY } from './types';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: any): Response<T> => {
        // 检查是否已经格式化（通过标识符判断）
        if (data && typeof data === 'object' && FORMATTED_KEY in data) {
          // 已格式化：移除标识符，直接返回
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [FORMATTED_KEY]: _unused, ...response } =
            data as FormattedResponse<T>;
          return response;
        }

        // 未格式化：使用默认格式化（中间件职责）
        return ResponseUtil.success(data) as Response<T>;
      }),
      catchError((error: Error) => throwError(() => error)),
    );
  }
}
