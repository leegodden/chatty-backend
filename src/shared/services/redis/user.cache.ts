import { RedisClient } from './base.cache';
import Logger from 'bunyan';
import BaseCache from './base.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { ServerError } from '@global/helpers/error-handler';
import { parseJson } from '@global/helpers/helpers';

type UserCache = {
  client: RedisClient;
  log: Logger;
  saveUserToCache: (key: string, userUId: string, createdUser: IUserDocument) => Promise<void>;
  getUserFromCache: (userId: string) => Promise<IUserDocument>;
};

const { client, log } = BaseCache('userCache');

const UserCache = (): UserCache => {
  return {
    client,
    log,
    saveUserToCache,
    getUserFromCache
  };
};

export const saveUserToCache = async (key: string, userUId: string, createdUser: IUserDocument): Promise<void> => {
  const createdAt = new Date();

  const {
    _id,
    uId,
    username,
    email,
    avatarColor,
    blocked,
    blockedBy,
    postsCount,
    profilePicture,
    followersCount,
    followingCount,
    notifications,
    work,
    location,
    school,
    quote,
    bgImageId,
    bgImageVersion,
    social
  } = createdUser;

  const dataToSave = {
    _id: `${_id}`,
    uId: `${uId}`,
    username: `${username}`,
    email: `${email}`,
    avatarColor: `${avatarColor}`,
    createdAt: `${createdAt}`,
    postsCount: `${postsCount}`,
    blocked: JSON.stringify(blocked),
    blockedBy: JSON.stringify(blockedBy),
    profilePicture: `${profilePicture}`,
    followersCount: `${followersCount}`,
    followingCount: `${followingCount}`,
    notifications: JSON.stringify(notifications),
    social: JSON.stringify(social),
    work: `${work}`,
    location: `${location}`,
    school: `${school}`,
    quote: `${quote}`,
    bgImageVersion: `${bgImageVersion}`,
    bgImageId: `${bgImageId}`
  };

  try {
    if (!client.isOpen) {
      await client.connect();
    }

    // Create the set user
    await client.ZADD('user', { score: parseInt(userUId, 10), value: `${key}` });

    // Store data as hash fields
    for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
      await client.HSET(`users:${key}`, `${itemKey}`, `${itemValue}`);
    }
  } catch (error) {
    log.error(error);
    throw new ServerError('Server error. Try again.');
  }
};

// get data from redis and parse  specific fields back to original JSON format
export const getUserFromCache = async (userId: string): Promise<IUserDocument> => {
  try {
    if (!client.isOpen) {
      await client.connect();
    }

    const response: IUserDocument = (await client.HGETALL(`users:${userId}`)) as unknown as IUserDocument;
    response.createdAt = new Date(parseJson(`${response.createdAt}`));
    response.postsCount = parseJson(`${response.postsCount}`);
    response.blocked = parseJson(`${response.blocked}`);
    response.blockedBy = parseJson(`${response.blockedBy}`);
    response.notifications = parseJson(`${response.notifications}`);
    response.social = parseJson(`${response.social}`);
    response.followersCount = parseJson(`${response.followersCount}`);
    response.followingCount = parseJson(`${response.followingCount}`);
    response.bgImageId = parseJson(`${response.bgImageId}`);
    response.bgImageVersion = parseJson(`${response.bgImageVersion}`);
    response.profilePicture = parseJson(`${response.profilePicture}`);
    response.quote = parseJson(`${response.quote}`);
    return response;
  } catch (error) {
    log.error(error);
    throw new ServerError('Server error. Try again.');
  }
};

export default UserCache;
