/* eslint-disable no-unused-vars */
import { UserRole as EUserRole } from '../../../../prisma';
import { TAuth } from '../auth/Auth.interface';
import { TOtp } from '../otp/Otp.interface';

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
  otp?: TOtp;
};

export { EUserRole };
