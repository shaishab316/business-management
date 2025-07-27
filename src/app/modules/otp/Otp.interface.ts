import { Types } from 'mongoose';

export type TOtp = {
  _id?: Types.ObjectId;

  user: Types.ObjectId;
  code: string;
  exp: Date;
};
