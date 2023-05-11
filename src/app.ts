import express, { Express } from 'express';
import { ChattyServer } from './setupServer';
import databaseConnection from './setupDatabase';
import { config } from './config';

const initialize = (): void => {
  config.validateConfig();
  databaseConnection();
  const app: Express = express();
  ChattyServer({ app });
};

initialize();
