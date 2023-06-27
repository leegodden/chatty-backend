import { createClient } from 'redis';
import Logger from 'bunyan';
import { config } from '@root/config';

export type RedisClient = ReturnType<typeof createClient>;

const BaseCache = (cacheName: string) => {
  // get the redis url from config annd assignto 'client'
  const client: RedisClient = createClient({ url: config.REDIS_HOST });
  const log: Logger = config.createLogger(cacheName);

  const cacheError = (): void => {
    client.on('error', (error: unknown) => {
      log.error(error);
    });
  };

  cacheError();

  return {
    client,
    log
  };
};

export default BaseCache;
