/* eslint-disable no-unused-vars */
import { TUser } from './User.interface';
import User from './User.model';
import { RootFilterQuery, Types } from 'mongoose';
import { TList } from '../query/Query.interface';
import Auth from '../auth/Auth.model';
import { TAuth } from '../auth/Auth.interface';
import { Request } from 'express';
import { userSearchableFields as searchFields } from './User.constant';
import { deleteImage } from '../../middlewares/capture';
import { useSession } from '../../../util/db/session';
import prisma from '../../../util/prisma';

export const UserServices = {
  async create({ password, ...userData }: TUser & TAuth) {
    return prisma.user.create({
      data: {
        ...userData,
        Auth: {
          create: {
            password: await password?.hash(),
          },
        },
      },
    });
  },

  async edit({ user, body }: Request) {
    if (body.avatar && user.avatar) await deleteImage(user.avatar);

    Object.assign(user, body);

    return user.save();
  },

  async list({ page, limit, search }: TList) {
    const filter: RootFilterQuery<TUser> = {};

    if (search)
      filter.$or = searchFields.map(field => ({
        [field]: {
          $regex: search,
          $options: 'i',
        },
      }));

    const users = await User.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(filter);

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      users,
    };
  },

  async delete(userId: Types.ObjectId) {
    return useSession(async session => {
      const user = await User.findByIdAndDelete(userId).session(session);
      await Auth.findOneAndDelete({ user: userId }).session(session);

      if (user?.avatar) await deleteImage(user.avatar);

      return user;
    });
  },
};
