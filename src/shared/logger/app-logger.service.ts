import { Injectable, Logger as NestLogger } from '@nestjs/common';
import type {
  AppLoggerContract,
  LogContext,
  LogPayload,
  LogTrace,
  ScopedAppLogger,
} from './logger.types';

/** 应用统一日志入口；更换实现时主要改本类。 */
@Injectable()
export class AppLogger implements AppLoggerContract {
  log(message: LogPayload, context?: LogContext): void;
  log(message: unknown, context?: LogContext): void;
  log(message: unknown, context?: LogContext): void {
    NestLogger.log(message, context);
  }

  error(message: LogPayload, trace?: LogTrace, context?: LogContext): void;
  error(message: unknown, trace?: LogTrace, context?: LogContext): void;
  error(message: unknown, trace?: LogTrace, context?: LogContext): void {
    NestLogger.error(message, trace, context);
  }

  warn(message: LogPayload, context?: LogContext): void;
  warn(message: unknown, context?: LogContext): void;
  warn(message: unknown, context?: LogContext): void {
    NestLogger.warn(message, context);
  }

  debug(message: LogPayload, context?: LogContext): void;
  debug(message: unknown, context?: LogContext): void;
  debug(message: unknown, context?: LogContext): void {
    NestLogger.debug(message, context);
  }

  verbose(message: LogPayload, context?: LogContext): void;
  verbose(message: unknown, context?: LogContext): void;
  verbose(message: unknown, context?: LogContext): void {
    NestLogger.verbose(message, context);
  }

  forContext(context: LogContext): ScopedAppLogger {
    return {
      log: (message: LogPayload) => this.log(message, context),
      error: (message: LogPayload, trace?: LogTrace) =>
        this.error(message, trace, context),
      warn: (message: LogPayload) => this.warn(message, context),
      debug: (message: LogPayload) => this.debug(message, context),
      verbose: (message: LogPayload) => this.verbose(message, context),
    };
  }
}
