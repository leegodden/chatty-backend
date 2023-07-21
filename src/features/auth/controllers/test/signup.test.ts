import { Request, Response } from 'express';
import * as cloudinaryUploads from '@global/helpers/cloudinary-uploads';
import { authMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { createSignUp } from '../signup';
import { CustomError } from '@global/helpers/error-handler';
import * as authService from '@service/db/auth.service';
import * as UserCache from '@service/redis/user.cache';

jest.useFakeTimers();
//jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@service/queues/user.queue');
jest.mock('@service/queues/auth.queue');
jest.mock('@global/helpers/cloudinary-uploads');

describe('createSignUp', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if username is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: '',
        email: 'manny@test.com',
        password: 'creatures01',
        avatarColor: 'red',
        avatarImage: 'data:text/plain:base64,SVGsbG8sIHdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();
    createSignUp(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field');
    });
  });

  it('should throw an error if username < minimum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'ma',
        email: 'manny@test.com',
        password: 'creatures01',
        avatarColor: 'red',
        avatarImage: 'data:text/plain:base64,SVGsbG8sIHdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();
    createSignUp(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if email is not valid', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'manny',
        email: 'not valid',
        password: 'creatures01',
        avatarColor: 'red',
        avatarImage: 'data:text/plain:base64,SVGsbG8sIHdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();
    createSignUp(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email must be valid');
    });
  });

  it('should throw an error if email is not entered', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'manny',
        email: '',
        password: 'creatures01',
        avatarColor: 'red',
        avatarImage: 'data:text/plain:base64,SVGsbG8sIHdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();
    createSignUp(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email is a required field');
    });
  });

  it('should throw an error if password is not entered', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'manny',
        email: 'manny@test.com',
        password: '',
        avatarColor: 'red',
        avatarImage: 'data:text/plain:base64,SVGsbG8sIHdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();
    createSignUp(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password is a required field');
    });
  });

  it('should throw an error if password < minumum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'manny',
        email: 'manny@test.com',
        password: 'cr',
        avatarColor: 'red',
        avatarImage: 'data:text/plain:base64,SVGsbG8sIHdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();
    createSignUp(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw an error if password > maximum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'manny',
        email: 'manny@test.com',
        password: 'creaturesohmygodthisistoolong',
        avatarColor: 'red',
        avatarImage: 'data:text/plain:base64,SVGsbG8sIHdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();
    createSignUp(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('it should throw an unauthorized error is user already exists', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Cyrilsmith',
        email: 'cyril@gmail.com',
        password: 'creatures01',
        avatarColor: 'red',
        avatarImage: 'data:text/plain:base64,SVGsbG8sIHdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(authMock);
    createSignUp(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('A user with that username or email already exists.');
    });
  });

  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Manny',
        email: 'manny@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(null as any);
    const userSpy = jest.spyOn(UserCache, 'saveUserToCache');
    jest
      .spyOn(cloudinaryUploads, 'uploads')
      .mockImplementation((): any => Promise.resolve({ version: '1234737373', public_id: '123456' }));

    await createSignUp(req, res);
    expect(req.session?.jwt).toBeDefined();
    expect(res.json).toHaveBeenCalledWith({
      message: 'User created successfully',
      user: userSpy.mock.calls[0][2],
      token: req.session?.jwt
    });
  });
});
