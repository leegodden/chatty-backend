/* eslint-disable @typescript-eslint/no-explicit-any */
import { JoiRequestValidationError } from '@global/helpers/error-handler';
import { Request } from 'express';
import { ObjectSchema } from 'joi';

// define decorator signature
type IJoiDecorator = (target: any, key: string, descriptor: PropertyDescriptor) => void;

export function joiValidation(schema: ObjectSchema): IJoiDecorator {
  return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    // args = req, res, next which will be passed in from controller
    descriptor.value = async function (...args: any[]) {
      const req: Request = args[0];

      const { error } = await Promise.resolve(schema.validate(req.body));
      if (error?.details) {
        throw new JoiRequestValidationError(error.details[0].message);
      }
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}
