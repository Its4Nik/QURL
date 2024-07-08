// logger.js

const { createLogger, transports, format } = require('winston');

const logger = createLogger({
  level: 'info',  // Set the logging level: 'info', 'warn', 'error', etc.
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),  // Add timestamp to logs
    format.json()  // Log in JSON format
  ),
  transports: [
    new transports.Console()  // Log to console
    // Add more transports as needed (e.g., file, database, etc.)
  ]
});

module.exports = logger;
