import { Compromise as TCompromise } from '../../../../prisma';
import prisma from '../../../util/prisma';
import { TPagination } from '../../../util/server/serveResponse';
import { TList } from '../query/Query.interface';

export const CompromiseServices = {
  async compromise({ notificationId, influencerId, date }: TCompromise) {
    if (date < new Date()) throw new Error('Date must be in the future');

    return prisma.compromise.upsert({
      where: {
        notificationId_influencerId: {
          notificationId,
          influencerId,
        },
      },
      create: {
        notificationId,
        influencerId,
        date,
        history: [date],
      },
      update: {
        notificationId,
        influencerId,
        date,
        history: {
          push: [date],
        },
      },
    });
  },

  async getAll({ page, limit, ...where }: TList) {
    const compromises = await prisma.compromise.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        influencer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        notification: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    const total = await prisma.compromise.count({
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
      compromises,
    };
  },
};
