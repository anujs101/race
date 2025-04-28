/**
 * Logger Utility
 * 
 * Provides structured logging functionality for the application.
 */

const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let metaStr = '';
  if (Object.keys(metadata).length > 0) {
    metaStr = JSON.stringify(metadata);
  }
  return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
});

// Define logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    logFormat
  ),
  defaultMeta: { service: 'resume-api' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // File transport for errors
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error'
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log')
    })
  ]
});

// If not in production, log to console with pretty format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Handle uncaught exceptions and unhandled rejections
if (process.env.NODE_ENV === 'production') {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error });
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason, promise });
  });
}

module.exports = logger; 