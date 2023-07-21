import { userService } from '@service/db/user.service';
import { getUserFromCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';

//const userCache: UserCache = UserCache();

// get the current user and session...
export const CurrentUser = async (req: Request, res: Response) => {
  let isUser = false;
  let token = null;
  let user = null;

  const cachedUser: IUserDocument = (await getUserFromCache(`${req.currentUser!.userId}`)) as IUserDocument;
  const existingUser: IUserDocument = cachedUser
    ? cachedUser
    : await userService.getUserById(`${req.currentUser!.userId}`);

  if (Object.keys(existingUser).length) {
    isUser = true;
    token = req.session?.jwt;
    user = existingUser;
  }
  res.status(200).json({
    isUser,
    token,
    user
  });
};
