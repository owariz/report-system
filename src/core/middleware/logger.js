const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' })
  ]
});

function logRequest(req, res, next) {
  logger.info({
    method: req.method,
    url: req.url,
    body: req.body,
    time: new Date().toISOString()
  });
  next();
}

module.exports = { logger, logRequest }; 