import winston from "winston";

const log = winston.createLogger({
  level: process.env.LOGLEVEL?.toLowerCase() ?? 'info',
  defaultMeta: { service: 'workers' }
});

if (process.env.NODE_ENV !== 'production') {
  log.add(new winston.transports.Console({ 
    format: winston.format.simple(),
  }));
}

export function getLogger (): winston.Logger {
  return log;
}