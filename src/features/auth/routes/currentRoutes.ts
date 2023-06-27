import { CurrentUser } from '@auth/controllers/current-user';
import { checkAuthentication } from '@global/helpers/auth-middleware';

import express, { Router } from 'express';

const CurrentUserRoutes = (): Router => {
  const router: Router = express.Router();

  router.get('/currentuser', checkAuthentication, CurrentUser);

  return router;
};

export { CurrentUserRoutes };
