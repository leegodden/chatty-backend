import express, { Express } from 'express';
import { ChattyServer } from '@root/setupServer';
import databaseConnection from '@root/setupDatabase';
import { config } from './config';

const initialize = (): void => {
  config.validateConfig();
  config.cloudinaryConfig();
  databaseConnection();
  const app: Express = express();
  ChattyServer({ app });
};

initialize();
