/* eslint-disable no-unused-vars */
import { TList } from '../query/Query.interface';
import { userSearchableFields as searchFields } from './User.constant';
import { deleteImage } from '../../middlewares/capture';
import prisma from '../../../util/prisma';
import { EUserRole, Auth as TAuth, User as TUser } from '../../../../prisma';
import { TPagination } from '../../../util/server/serveResponse';

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

  async edit({ user, body }: { user: TUser; body: Partial<TUser> }) {
    if (body.avatar) user?.avatar?._pipe(deleteImage);

    return prisma.user.update({
      where: { id: user.id },
      data: body,
    });
  },

  async list({ page, limit, search, ...filter }: TUser & TList) {
    filter ??= {} as any;

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
        } as TPagination,
      },
      users,
    };
  },

  async delete(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    user?.avatar?._pipe(deleteImage); // delete avatar

    return prisma.user.delete({ where: { id: userId } });
  },

  async updateRating(influencerId: string) {
    const {
      _avg: { rating },
      _count,
    } = await prisma.review.aggregate({
      where: { influencerId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const influencer = await prisma.user.update({
      where: { id: influencerId },
      data: { rating: rating ?? 0 },
    });

    return {
      rating: influencer.rating,
      review_count: _count.rating ?? 0,
    };
  },

  async getPendingInfluencers({ page, limit }: TList) {
    const where = {
      role: EUserRole.USER,
      socials: {
        some: {},
      },
    };

    const influencers = await prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.user.count({
      where,
    });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
      },
      influencers,
    };
  },

  async approveInfluencer(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { role: EUserRole.INFLUENCER },
    });
  },

  async declineInfluencer(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { socials: [], role: EUserRole.USER },
    });
  },
};
