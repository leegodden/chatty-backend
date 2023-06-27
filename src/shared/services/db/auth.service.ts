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

export const getAuthUserByUsername = async (username: string): Promise<IAuthDocument> => {
  // find matching record, true if found
  const user: IAuthDocument = (await AuthModel.findOne({
    username: Helpers.firstLetterUppercase(username)
  }).exec()) as IAuthDocument;
  return user;
};

export const createAuthUser = async (data: IAuthDocument): Promise<void> => {
  await AuthModel.create(data);
};
