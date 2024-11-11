import { createLogger, format, transports } from 'winston';
const { combine, timestamp, json, colorize } = format;

const consoleLogFormat = format.combine(
  format.colorize(),
  format.printf(({ level, message, timestamp }) => {
    return `${level}: ${message}`;
  })
);

const logger = createLogger({
  level: 'debug',
  format: combine(colorize(), timestamp(), json()),
  transports: [
    new transports.Console({
      format: consoleLogFormat,
    }),
  ],
});

export default logger;
