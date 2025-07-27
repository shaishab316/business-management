import { model, Schema } from 'mongoose';
import { TUser } from './User.interface';
import config from '../../../config';
import { EUserRole } from '../../../../prisma';

const userSchema = new Schema<TUser>(
  {
    name: {
      type: String,
      default: 'Mr. User',
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: config.server.default_avatar,
    },
    role: {
      type: String,
      enum: Object.values(EUserRole),
      default: EUserRole.GUEST,
    },
    phone: {
      type: String,
      default: '0123456789',
    },
  },
  { timestamps: true, versionKey: false },
);

const User = model<TUser>('User', userSchema);

export default User;
