const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  const statusCode = err.status || 500;
  const isOperationalError = err.isOperational || statusCode < 500; // Assume errors with status < 500 are operational

  // Log the error with more details
  // For operational errors, we might log them as 'warn' or 'info' if they are expected (e.g., validation errors)
  // For unexpected server errors (500), log as 'error'
  const logLevel = isOperationalError && statusCode !== 401 && statusCode !== 403 ? 'warn' : 'error';

  logger.log(logLevel, `${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
    // Adding additional context to the log
    name: err.name,
    status: statusCode,
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined, // Only show stack in dev for cleaner prod logs
    isOperational: err.isOperational, // If you define this property on your custom errors
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user ? { uid: req.user.uid, email: req.user.email } : 'Guest',
    // Avoid logging sensitive parts of req.body or req.params directly in production
    // body: process.env.NODE_ENV !== 'production' ? req.body : { redacted: true },
  });

  // In production, for 500 errors, do not send the original error message to the client
  const clientMessage = (process.env.NODE_ENV === 'production' && statusCode >= 500 && !isOperationalError)
    ? 'An unexpected error occurred. Please try again later.'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    isError: true,
    message: clientMessage,
    // Optionally, include an error code or reference for support
    // errorCode: err.code,
    // errorReference: someGeneratedIdForThisErrorInstance
  });
}; 