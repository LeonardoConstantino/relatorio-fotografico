/**
 * Sistema de Logging com níveis e namespaces
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export class Logger {
  private level: LogLevel;
  private prefix: string;

  constructor(options: { level?: LogLevel; prefix?: string } = {}) {
    this.level = options.level ?? LogLevel.INFO;
    this.prefix = options.prefix || '[Aura]';
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private format(namespace: string, msg: string): string {
    const timestamp = new Intl.DateTimeFormat('pt-br', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      hour12: false,
    }).format(new Date());

    return `${this.prefix} [${namespace}] ${msg} (${timestamp})`;
  }

  debug(namespace: string, msg: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(
        `%c🐛 ${this.format(namespace, msg)}`,
        'color: #888',
        ...args,
      );
    }
  }

  info(namespace: string, msg: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(
        `%cℹ️ ${this.format(namespace, msg)}`,
        'color: #2196F3',
        ...args,
      );
    }
  }

  warn(namespace: string, msg: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(
        `%c⚠️ ${this.format(namespace, msg)}`,
        'color: #FF9800',
        ...args,
      );
    }
  }

  error(namespace: string, msg: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(
        `%c❌ ${this.format(namespace, msg)}`,
        'color: #F44336',
        ...args,
      );
    }
  }
}

// Instância única para o app
export const logger = new Logger({ level: LogLevel.DEBUG });
