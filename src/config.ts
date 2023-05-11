import dotenv from 'dotenv';
import bunyan from 'bunyan';

dotenv.config();

const createLogger = (name: string) => bunyan.createLogger({ name, level: 'debug' });

export const config = {
  DATABASE_URL: process.env.DATABASE_URL as string | undefined,
  JWT_TOKEN: process.env.JWT_TOKEN as string | undefined,
  NODE_ENV: process.env.NODE_ENV as string | undefined,
  SECRET_KEY_ONE: process.env.SECRET_KEY_ONE as string | undefined,
  SECRET_KEY_TWO: process.env.SECRET_KEY_TWO as string | undefined,
  CLIENT_URL: process.env.CLIENT_URL as string | undefined,
  REDIS_HOST: process.env.REDIS_HOST as string | undefined,

  createLogger,

  validateConfig() {
    const undefinedKeys = Object.keys(config).filter((key) => config[key as keyof typeof config] === undefined);
    if (undefinedKeys.length > 0) {
      throw new Error(`Undefined or missing environment variables: ${undefinedKeys.join(', ')}`);
    }
  }
};
