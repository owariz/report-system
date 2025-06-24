const winston = require('winston');

const { combine, timestamp, printf, colorize, json, splat, errors } = winston.format;

// Define different log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define different colors for each level (optional, for console output)
const levelColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(levelColors);

// Custom format for console (development)
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  splat(), // Necessary to produce the 'meta' property
  errors({ stack: true }), // Log stack traces
  printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}` + (info.stack ? `\n${info.stack}` : '') + (Object.keys(info.meta || {}).length ? ` ${JSON.stringify(info.meta)}` : ''))
);

// Format for production (e.g., JSON for log management systems)
const productionFormat = combine(
  timestamp(),
  splat(),
  errors({ stack: true }),
  json()
);

const transports = [
  // Console transport
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? productionFormat : consoleFormat,
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'), // More verbose in dev
  }),
];

// In production, you might want to add a file transport or a transport for a log management service
// if (process.env.NODE_ENV === 'production') {
//   transports.push(
//     new winston.transports.File({
//       filename: 'logs/error.log',
//       level: 'error',
//       format: productionFormat,
//     }),
//     new winston.transports.File({
//       filename: 'logs/combined.log',
//       format: productionFormat,
//     })
//   );
// }

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels,
  format: process.env.NODE_ENV === 'production' ? productionFormat : consoleFormat, // Default format
  transports,
  exitOnError: false, // Do not exit on handled exceptions
});

// Create a stream object with a 'write' function that will be used by Morgan (if you use it for HTTP request logging)
logger.stream = {
  write: (message) => {
    logger.http(message.substring(0, message.lastIndexOf('\n')));
  },
};

module.exports = logger;
