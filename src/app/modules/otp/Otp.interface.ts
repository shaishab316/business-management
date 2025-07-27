import { Types } from 'mongoose';
import { TUser } from '../user/User.interface';

export type TOtp = {
  _id?: Types.ObjectId;

  userId: string;
  user: TUser;
  code: string;
  exp: Date;
};
