/* eslint-disable no-unused-vars */

export type TUser = {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  role: UserRole;
  name?: string | null;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  city?: string | null;
  socials?: string[];
  followers: number;
};

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUB_ADMIN = 'SUB_ADMIN',
}
