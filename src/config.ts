import dotenv from 'dotenv';
import bunyan from 'bunyan';
import cloudinary from 'cloudinary';

dotenv.config();

const createLogger = (name: string) => bunyan.createLogger({ name, level: 'debug' });

export const config = {
  DATABASE_URL: process.env.DATABASE_URL as string | undefined,
  JWT_TOKEN: process.env.JWT_TOKEN as string | undefined,
  NODE_ENV: process.env.NODE_ENV as string | undefined,
  SECRET_KEY_ONE: process.env.SECRET_KEY_ONE as string | undefined,
  SECRET_KEY_TWO: process.env.SECRET_KEY_TWO as string | undefined,
  CLIENT_URL: process.env.CLIENT_URL as string | undefined,
  REDIS_HOST: process.env.REDIS_HOST as string | undefined,
  CLOUDINARY_NAME: process.env.CLOUDINARY_NAME as string | undefined,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string | undefined,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string | undefined,
  SENDER_EMAIL: process.env.SENDER_EMAIL as string | undefined,
  SENDER_EMAIL_PASSWORD: process.env.SENDER_EMAIL_PASSWORD as string | undefined,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY as string | undefined,
  SENDGRID_SENDER: process.env.SENDGRID_SENDER as string | undefined,

  createLogger,

  // test for missing env variables
  validateConfig() {
    const undefinedKeys = Object.keys(config).filter((key) => config[key as keyof typeof config] === undefined);
    if (undefinedKeys.length > 0) {
      throw new Error(`Undefined or missing environment variables: ${undefinedKeys.join(', ')}`);
    }
  },

  cloudinaryConfig(): void {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }
};
