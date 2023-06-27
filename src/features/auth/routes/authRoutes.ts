import { SignIn } from '@auth/controllers/signin';
import { SignOut } from '@auth/controllers/signout';
import { createSignUp } from '@auth/controllers/signup';
import express, { Router } from 'express';

const authRoutes = (): Router => {
  const router: Router = express.Router();

  router.post('/signup', createSignUp);
  router.post('/signin', SignIn);

  return router;
};

const signOutRoutes = (): Router => {
  const router: Router = express.Router();

  router.get('/signout', SignOut);

  return router;
};

export { authRoutes, signOutRoutes };
