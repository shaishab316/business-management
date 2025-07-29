import { Schema } from 'mongoose';
import { hashPassword } from './Auth.utils';
import { Auth as TAuth } from '../../../../prisma';

export const AuthMiddlewares = {
  schema: (schema: Schema<TAuth>) => {
    schema.pre('save', async function (next) {
      try {
        if (this.isModified('password'))
          this.password = await hashPassword(this.password);
      } finally {
        next();
      }
    });
  },
};
