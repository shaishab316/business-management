/* eslint-disable no-unused-vars */
import { TAuth } from '../auth/Auth.interface';

export type TUser = {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  role: EUserRole;
  name?: string | null;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  city?: string | null;
  socials?: string[];
  followers: number;

  auth?: TAuth;
};

export enum EUserRole {
  GUEST = 'GUEST',
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUB_ADMIN = 'SUB_ADMIN',
}
