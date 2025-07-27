import config from '../../../config';
import { TUser } from '../user/User.interface';

export type TAuth = {
  id: string;

  userId: string;
  user: TUser;
  password: string;
};

export type TToken = keyof typeof config.jwt;
