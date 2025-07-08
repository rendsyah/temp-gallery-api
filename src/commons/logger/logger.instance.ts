import winston from 'winston';
import LokiTransport from 'winston-loki';

const {
  NODE_ENV = 'development',
  API_NAME = 'gallery-service',
  LOKI_URL,
  LOKI_USER,
  LOKI_PASS,
  LOG_LEVEL = 'info',
} = process.env;

const transports = {
  test: [],
  development: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.prettyPrint(),
      ),
    }),
  ],
  production: [
    new LokiTransport({
      host: LOKI_URL as string,
      basicAuth: `${LOKI_USER}:${LOKI_PASS}`,
      labels: { service: API_NAME },
      json: true,
      format: winston.format.json(),
      onConnectionError: (err) => console.error('Loki Error:', err),
    }),
  ],
};

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  transports: transports[NODE_ENV],
});
