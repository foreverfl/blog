import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf((info) => {
      const { timestamp, level, message } = info;
      return `${timestamp} [${level}] ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      dirname: 'logs',
      filename: '%DATE%.log', // ex: 2025-05-31.log
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxSize: '200m',
      maxFiles: '30d',
    }),
  ],
});

export default logger;