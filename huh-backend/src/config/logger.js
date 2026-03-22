const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    level: 'debug',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.colorize(),
        format.printf(({ timestamp, level, message, stack, ...meta }) => {
            let log = `[${timestamp}] ${level}: ${message}`;
            if (Object.keys(meta).length) log += ` | ${JSON.stringify(meta)}`;
            if (stack) log += `\n${stack}`;
            return log;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
    ],
});

module.exports = logger;