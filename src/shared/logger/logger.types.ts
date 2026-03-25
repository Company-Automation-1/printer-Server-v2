/**
 * 日志分类名（对应 Nest `Logger` 的 context），如 `'PrinterService'`、`'HTTP'`。
 */
export type LogContext = string;

/**
 * `error` 第二参：堆栈或补充说明，传给 Nest `Logger.error`。
 */
export type LogTrace = string | undefined;

/**
 * 常见日志正文：标量、Error、任意引用类型（含数组、Map、class 实例等）。
 * 若持有 `unknown`，可先收窄或 `as LogPayload` 再传入。
 */
export type LogPayload =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | Error
  | object;

/** `forContext` 返回的固定上下文记录器 */
export interface ScopedAppLogger {
  log(message: LogPayload): void;
  error(message: LogPayload, trace?: LogTrace): void;
  warn(message: LogPayload): void;
  debug(message: LogPayload): void;
  verbose(message: LogPayload): void;
}

/** 与 {@link AppLogger} 实例方法一致，便于 mock / 文档引用 */
export interface AppLoggerContract {
  log(message: LogPayload, context?: LogContext): void;
  error(message: LogPayload, trace?: LogTrace, context?: LogContext): void;
  warn(message: LogPayload, context?: LogContext): void;
  debug(message: LogPayload, context?: LogContext): void;
  verbose(message: LogPayload, context?: LogContext): void;
  forContext(context: LogContext): ScopedAppLogger;
}
