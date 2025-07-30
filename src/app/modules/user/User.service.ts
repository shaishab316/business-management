/* eslint-disable no-unused-vars */
import { TList } from '../query/Query.interface';
import { Request } from 'express';
import { userSearchableFields as searchFields } from './User.constant';
import { deleteImage } from '../../middlewares/capture';
import prisma from '../../../util/prisma';
import { Auth as TAuth, User as TUser } from '../../../../prisma';

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
    if (body.avatar && user.avatar) deleteImage(user.avatar); //! for faster don't wait

    return prisma.user.update({
      where: { id: user.id },
      data: body,
    });
  },

  async list({ page, limit, search }: TList) {
    const filter: any = {};

    if (search)
      filter.OR = searchFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));

    const users = await prisma.user.findMany({
      where: filter,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.user.count({ where: filter });

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

  async delete(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    user?.avatar?.pipe(deleteImage); // delete avatar

    return prisma.user.delete({ where: { id: userId } });
  },
};
