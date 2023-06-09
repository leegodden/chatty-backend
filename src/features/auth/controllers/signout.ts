import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';

export const SignOut = async (req: Request, res: Response): Promise<void> => {
  req.session = null;
  res.status(HTTP_STATUS.OK).json({ message: 'Logout successful', user: {}, token: '' });
};
