import { format } from "logform";
import * as winston from "winston";
const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level} ${stack || message}`;
  })
);
const jsonFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level} ${stack || message}`;
  }),
  format.json()
);
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error", format: jsonFormat }),
    new winston.transports.File({ filename: "logs/combined.log", format: jsonFormat }),
    new winston.transports.Console({ format: consoleFormat }),
  ],
});
export { logger };
