import { Request, Response } from 'express';
import { config } from '@root/config';
// import { loginSchema } from '@auth/schemas/signin';
import JWT from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';

import { getAuthUserByUsername } from '@service/db/auth.service';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { IResetPasswordParams, IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@service/db/user.service';
//import ForgotPasswordTemplate from '@service/emails/templates/forgot-password-template';
import { addEmailJob } from '@service/queues/email.queue';
import moment from 'moment';
import publicIP from 'ip';
import ResetPasswordTemplate from '@service/emails/templates/reset-password-template';
import { BadRequestError } from '@global/helpers/error-handler';

//import MailTransport from '@service/emails/mail.transport';

export const SignIn = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  const existingUser: IAuthDocument = await getAuthUserByUsername(username);

  if (!existingUser) {
    throw new BadRequestError('Invalid credentials');
  }

  const passwordMatch: boolean = await existingUser.comparePassword(password);
  if (!passwordMatch) {
    throw new BadRequestError('Invalid credentials');
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

  // Testing email and forgot and reset password template

  // await MailTransport.sendEmail('philip.bednar43@ethereal.email', 'Testing development email', 'This is a test email');

  const templateParams: IResetPasswordParams = {
    username: existingUser.username,
    email: existingUser.email,
    ipaddress: publicIP.address(),
    date: moment().format('YYYY-MM-DD HH:mm:ss')
  };

  //const resetLink = `${config.CLIENT_URL}/reset-password?token=123455654567765`;
  const template: string = ResetPasswordTemplate(templateParams);
  addEmailJob('forgotPasswordEmail', {
    template,
    receiverEmail: 'neoma.russel84@ethereal.email',
    subject: 'Password reset confirmation'
  });

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
