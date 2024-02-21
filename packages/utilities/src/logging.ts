import winston from "winston";

const log = winston.createLogger({
  level: process.env.LOGLEVEL?.toLowerCase() ?? "info",
});

if (process.env.NODE_ENV !== "production") {
  log.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

export function getLogger(): winston.Logger {
  return log;
}
export function getLoggerWithData(extraData: Record<string, any>) {
  return {
    info(message: string, data: object = {}) {
      log.info(message, { ...data, ...extraData });
    },
    warn(message: string, data: object = {}) {
      log.warn(message, { ...data, ...extraData });
    },
    error(message: string, data: object = {}) {
      log.warn(message, { ...data, ...extraData });
    },
    debug(message: string, data: object = {}) {
      log.debug(message, { ...data, ...extraData });
    },
  };
}
