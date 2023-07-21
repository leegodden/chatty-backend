/*
Defines a service called authService that provides a function getUserByUsernameOrEmail to retrieve a
user from a MongoDB collection based on their username or email. The Helpers functions are used to modify
the search criteria before executing the query.
*/

import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';
import { Helpers } from '@global/helpers/helpers';

export const getUserByUsernameOrEmail = async (username: string, email: string): Promise<IAuthDocument> => {
  const query = {
    $or: [{ username: Helpers.firstLetterUppercase(username) }, { email: Helpers.lowerCase(email) }]
  };

  // find matching record, true if found
  const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;
  return user;
};

// find the record associated with the given username argument - true if found
export const getAuthUserByUsername = async (username: string): Promise<IAuthDocument> => {
  const user: IAuthDocument = (await AuthModel.findOne({
    username: Helpers.firstLetterUppercase(username)
  }).exec()) as IAuthDocument;
  return user;
};

export const getAuthUserByEmail = async (email: string): Promise<IAuthDocument> => {
  const user: IAuthDocument = (await AuthModel.findOne({ email: Helpers.lowerCase(email) }).exec()) as IAuthDocument;
  return user;
};

export const getAuthUserByPasswordToken = async (token: string): Promise<IAuthDocument> => {
  const user: IAuthDocument = (await AuthModel.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  }).exec()) as IAuthDocument;
  return user;
};

export const createAuthUser = async (data: IAuthDocument): Promise<void> => {
  await AuthModel.create(data);
};

// update token and expiration date for the given authId and add to db
export const updatePasswordToken = async (authId: string, token: string, tokenExpiration: number): Promise<void> => {
  await AuthModel.updateOne(
    { _id: authId },
    {
      passwordResetToken: token,
      passwordResetExpires: tokenExpiration
    }
  );
};
