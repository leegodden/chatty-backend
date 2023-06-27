import Logger from 'bunyan';
import { config } from '@root/config';
import { RedisClient } from './base.cache';

const log: Logger = config.createLogger('redisConnection');

const RedisConnection = (props: { client: RedisClient }) => {
  const { client } = props;

  const connect = async (): Promise<void> => {
    try {
      await client.connect();
      const res = await client.ping();
      console.log(res);
    } catch (error) {
      log.error(error);
    }
  };

  return connect; // Return the connect function directly
};

export default RedisConnection;
