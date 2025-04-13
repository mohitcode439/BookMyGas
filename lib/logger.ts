// Simple logging utility for the application
// This helps track actions performed in the application

enum LogLevel {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

class Logger {
  private static instance: Logger
  private logEnabled = true

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  public enableLogging(enabled: boolean): void {
    this.logEnabled = enabled
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    let formattedMessage = `[${timestamp}] [${level}] ${message}`

    if (data) {
      formattedMessage += ` - ${JSON.stringify(data)}`
    }

    return formattedMessage
  }

  public info(message: string, data?: any): void {
    if (!this.logEnabled) return
    const formattedMessage = this.formatMessage(LogLevel.INFO, message, data)
    console.log(formattedMessage)
  }

  public warning(message: string, data?: any): void {
    if (!this.logEnabled) return
    const formattedMessage = this.formatMessage(LogLevel.WARNING, message, data)
    console.warn(formattedMessage)
  }

  public error(message: string, error?: any): void {
    if (!this.logEnabled) return
    const formattedMessage = this.formatMessage(LogLevel.ERROR, message, error)
    console.error(formattedMessage)
  }

  public debug(message: string, data?: any): void {
    if (!this.logEnabled) return
    const formattedMessage = this.formatMessage(LogLevel.DEBUG, message, data)
    console.debug(formattedMessage)
  }
}

// Export a singleton instance
export const logger = Logger.getInstance()
