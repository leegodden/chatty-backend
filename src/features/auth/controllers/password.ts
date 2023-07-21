import { Request, Response } from 'express';
import { config } from '@root/config';
import HTTP_STATUS from 'http-status-codes';
import { BadRequestError } from '@global/helpers/error-handler';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { getAuthUserByEmail, getAuthUserByPasswordToken, updatePasswordToken } from '@service/db/auth.service';
import { emailSchema, passwordSchema } from '@auth/schemas/password';
import crypto from 'crypto';
import publicIP from 'ip';
import ForgotPasswordTemplate from '@service/emails/templates/forgot-password-template';
import { addEmailJob } from '@service/queues/email.queue';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import moment from 'moment';
import ResetPasswordTemplate from '@service/emails/templates/reset-password-template';

////////////////////////////////////
// Create password mddleware
///////////////////////////////////

export const createPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  // does user exist
  const existingUser: IAuthDocument = await getAuthUserByEmail(email);
  if (!existingUser) {
    throw new BadRequestError('Invalid credentials');
  }

  // Joi validation
  const validation = emailSchema.validate({
    email
  });

  if (validation.error) {
    throw new BadRequestError(validation.error.details[0].message);
  }

  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters: string = randomBytes.toString('hex');

  // call service passing in userId, token and token Expiration
  await updatePasswordToken(`${existingUser._id!}`, randomCharacters, Date.now() * 60 * 60 * 1000);

  const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`;

  // pass the existing users username and reset link to the template
  const template: string = ForgotPasswordTemplate(existingUser.username!, resetLink);

  // add job to queue
  addEmailJob('forgotPasswordEmail', { template, receiverEmail: email, subject: 'Reset your password' });
  res.status(HTTP_STATUS.OK).json({ message: 'Password reset link sent' });
};

///////////////////////////////
// Update password middleware
//////////////////////////////

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  const { password, confirmPassword } = req.body;

  //Joi validation
  const validation = passwordSchema.validate({
    password,
    confirmPassword
  });
  if (validation.error) {
    throw new BadRequestError(validation.error.details[0].message);
  }
  if (password !== confirmPassword) {
    throw new BadRequestError('Passwords do not match');
  }
  // does user exist
  const { token } = req.params;
  const existingUser: IAuthDocument = await getAuthUserByPasswordToken(token);
  if (!existingUser) {
    throw new BadRequestError('Reset token has expired.');
  }
  // update users password with the req.body
  existingUser.password = password;
  existingUser.passwordResetExpires = undefined;
  existingUser.passwordResetToken = undefined;
  await existingUser.save();

  const templateParams: IResetPasswordParams = {
    username: existingUser.username,
    email: existingUser.email,
    ipaddress: publicIP.address(),
    date: moment().format('DD/MM/YYYY HH:mm')
  };
  const template: string = ResetPasswordTemplate(templateParams);
  addEmailJob('forgotPasswordEmail', {
    template,
    receiverEmail: existingUser.email,
    subject: 'Password reset confirmation'
  });
  res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated.' });
};
