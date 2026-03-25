import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AppLogger, type ScopedAppLogger } from 'src/shared/logger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly log: ScopedAppLogger;

  constructor(appLogger: AppLogger) {
    this.log = appLogger.forContext('HTTP');
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = Date.now();
    res.on('finish', () => {
      this.log.log(
        `${method} ${originalUrl} ${res.statusCode} +${Date.now() - start}ms`,
      );
    });
    next();
  }
}
