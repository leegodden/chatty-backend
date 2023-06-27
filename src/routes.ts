import { Application } from 'express';
import { authRoutes, signOutRoutes } from '@auth/routes/authRoutes';
import { verifyUser } from '@global/helpers/auth-middleware';
import { CurrentUserRoutes } from '@auth/routes/currentRoutes';
import { getServerAdapter } from '@service/queues/base.queue';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    const serverAdapter = getServerAdapter();
    app.use(BASE_PATH, authRoutes());
    app.use(BASE_PATH, signOutRoutes());
    app.use(BASE_PATH, verifyUser, CurrentUserRoutes());
    app.use('/queues', serverAdapter.getRouter());
  };
  routes();
};
