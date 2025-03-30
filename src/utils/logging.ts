/**
 * Logging System
 * Provides centralized logging functionality with different log levels
 * 
 * 日志系统
 * 提供具有不同日志级别的集中式日志功能
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3
}

// Current log level
// 当前日志级别
let currentLogLevel: LogLevel = LogLevel.INFO;

/**
 * Log a message at the specified level
 * @param level Log level
 * @param message Log message
 * 
 * 记录指定级别的日志消息
 * @param level 日志级别
 * @param message 日志消息
 */
export function log(level: LogLevel, message: string): void {
  if (level >= currentLogLevel) {
    const timestamp = new Date().toISOString();
    let prefix: string;
    
    switch (level) {
      case LogLevel.DEBUG:
        prefix = '[DEBUG]';
        console.debug(`${timestamp} ${prefix} ${message}`);
        break;
      case LogLevel.INFO:
        prefix = '[INFO]';
        console.info(`${timestamp} ${prefix} ${message}`);
        break;
      case LogLevel.WARNING:
        prefix = '[WARNING]';
        console.warn(`${timestamp} ${prefix} ${message}`);
        break;
      case LogLevel.ERROR:
        prefix = '[ERROR]';
        console.error(`${timestamp} ${prefix} ${message}`);
        break;
    }
  }
}

/**
 * Set the log level
 * @param level New log level
 * 
 * 设置日志级别
 * @param level 新的日志级别
 */
export function setLogLevel(level: LogLevel | string): void {
  if (typeof level === 'string') {
    switch (level.toLowerCase()) {
      case 'debug':
        currentLogLevel = LogLevel.DEBUG;
        break;
      case 'info':
        currentLogLevel = LogLevel.INFO;
        break;
      case 'warning':
        currentLogLevel = LogLevel.WARNING;
        break;
      case 'error':
        currentLogLevel = LogLevel.ERROR;
        break;
      default:
        throw new Error(`Unknown log level: ${level}`);
    }
  } else {
    currentLogLevel = level;
  }
  
  log(LogLevel.INFO, `Log level set to: ${LogLevel[currentLogLevel]}`);
}

/**
 * Get current log level
 * @returns Current log level as string
 * 
 * 获取当前日志级别
 * @returns 当前日志级别的字符串表示
 */
export function getLogLevel(): string {
  return LogLevel[currentLogLevel];
}