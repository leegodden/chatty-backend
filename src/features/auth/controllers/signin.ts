import { Request, Response } from 'express';
import { config } from '@root/config';
//import { loginSchema } from '@auth/schemas/signin';
import JWT from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';
import { BadRequestError } from 'src/shared/globals/helpers/error-handler';
import { getAuthUserByUsername } from '@service/db/auth.service';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@service/db/user.service';

export const SignIn = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  const existingUser: IAuthDocument = await getAuthUserByUsername(username);
  if (!existingUser) {
    throw new BadRequestError('Invalid Credentials.');
  }

  const passwordMatch: boolean = await existingUser.comparePassword(password);
  if (!passwordMatch) {
    throw new BadRequestError('Invalid Credentials.');
  }

  const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);

  const userJwt: string = JWT.sign(
    {
      userId: user._id,
      uId: existingUser.uId,
      email: existingUser.email,
      username: existingUser.username,
      avatarColor: existingUser.avatarColor
    },
    config.JWT_TOKEN!
  );

  req.session = { jwt: userJwt };

  const userDocument: IUserDocument = {
    ...user,
    authId: existingUser._id,
    username: existingUser.username,
    email: existingUser.email,
    avatarColor: existingUser.avatarColor,
    uId: existingUser.uId,
    createdAt: existingUser.createdAt
  } as IUserDocument;
  res.status(HTTP_STATUS.OK).json({ message: 'User login successful', user: userDocument, token: userJwt });
};
