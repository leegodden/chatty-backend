import mongoose from 'mongoose';
import { config } from '@root/config';
import Logger from 'bunyan';
import RedisConnection from '@service/redis/redis.connection';
import { createClient } from 'redis';

const log: Logger = config.createLogger('setupDatabase.ts');

export default () => {
  const connect = () => {
    mongoose
      .connect(`${config.DATABASE_URL}`)
      .then(() => {
        log.info('Successfully connected to database.');

        const client = createClient({ url: config.REDIS_HOST });
        const redisConnection = RedisConnection({ client });
        redisConnection();
      })
      .catch((error) => {
        log.error('Error connecting to database', error);
        return process.exit(1);
      });
  };
  connect();

  mongoose.connection.on('disconnected', connect);
};
