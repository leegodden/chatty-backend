import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { signupSchema } from '@auth/schemas/signup';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { BadRequestError } from 'src/shared/globals/helpers/error-handler';
import { getUserByUsernameOrEmail } from '@service/db/auth.service';
import { generateRandomIntegers } from '@global/helpers/helpers';
import { Helpers } from '@global/helpers/helpers';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@global/helpers/cloudinary-uploads';
import HTTP_STATUS from 'http-status-codes';
import { IUserDocument } from '@user/interfaces/user.interface';
import UserCache from '@service/redis/user.cache';
//import { omit } from 'lodash';
import { addAuthUserJob } from '@service/queues/auth.queue';
import { addUserJob } from '@service/queues/user.queue';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';

const userCache = UserCache();

// validate users data signupSchema
export const createSignUp = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, avatarColor, avatarImage } = req.body;

  const validation = signupSchema.validate({
    username,
    email,
    password,
    avatarColor,
    avatarImage
  });

  if (validation.error) {
    throw new BadRequestError(validation.error.details[0].message);
  }

  // Does user's username or email exist? if true throw error
  const checkIfUserExist: IAuthDocument = await getUserByUsernameOrEmail(username, email);

  if (checkIfUserExist) {
    throw new BadRequestError('A user with that username or email already exists.');
  }

  const authObjectId: ObjectId = new ObjectId();
  const userObjectId: ObjectId = new ObjectId();
  const uId = `${generateRandomIntegers(12)}`;

  // Create an "authentication" document using `signupData` function to format the data
  const authData: IAuthDocument = signupData({
    _id: authObjectId,
    uId,
    username,
    email,
    password,
    avatarColor
  });

  // Upload avatar imgage to cloudinary
  const result: UploadApiResponse = (await uploads(avatarImage, `${userObjectId}`, true, true)) as UploadApiResponse;
  if (!result?.public_id) {
    throw new BadRequestError('File upload error occurred');
  }

  // Create "user" document using `userData` function
  const userDataForCache: IUserDocument = userData(authData, userObjectId);

  // Set profiePicture property to `userDataForCache` object
  userDataForCache.profilePicture = `https://res.cloudinary.com/leegodden/image/upload/v${result.version}/${userObjectId}`;

  // Save user data to Redis cache
  await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

  // Omit unwanted fields  with lodash
  //omit(userDataForCache, ['uId', 'username', 'email', 'avatarColor', 'password']);

  // Add `job` to "auth" queue to add auth user to database
  addAuthUserJob('addAuthUserToDB', { value: authData });

  // Add `job` to "user" queue to add the user data to the database.
  addUserJob('addUserToDB', { value: userDataForCache });

  // add user data to the session.
  const userJwt: string = signToken(authData, userObjectId);
  req.session = { jwt: userJwt };

  res
    .status(HTTP_STATUS.CREATED)
    // display reponse message and data as `user` and `token`
    .json({ message: 'User created successfully', user: userDataForCache, token: userJwt });
};

function signToken(data: IAuthDocument, userObjectId: ObjectId): string {
  return JWT.sign(
    {
      userId: userObjectId,
      uId: data.uId,
      email: data.email,
      username: data.username,
      avatarColor: data.avatarColor
    },
    config.JWT_TOKEN!
  );
}

function signupData(data: ISignUpData): IAuthDocument {
  const { _id, username, email, uId, password, avatarColor } = data;
  return {
    _id,
    uId,
    username: Helpers.firstLetterUppercase(username),
    email: Helpers.lowerCase(email),
    password,
    avatarColor,
    createdAt: new Date()
  } as IAuthDocument;
}

function userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
  const { _id, username, email, uId, password, avatarColor } = data;
  return {
    _id: userObjectId,
    authId: _id,
    uId,
    username: Helpers.firstLetterUppercase(username),
    email,
    password,
    avatarColor,
    profilePicture: '',
    blocked: [],
    blockedBy: [],
    work: '',
    location: '',
    school: '',
    quote: '',
    bgImageVersion: '',
    bgImageId: '',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    notifications: {
      messages: true,
      reactions: true,
      comments: true,
      follows: true
    },
    social: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: ''
    }
  } as unknown as IUserDocument;
}
