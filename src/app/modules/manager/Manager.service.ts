import { ETaskStatus, Prisma } from '../../../../prisma';
import prisma from '../../../util/prisma';
import { TPagination } from '../../../util/server/serveResponse';
import { TList } from '../query/Query.interface';

export const ManagerServices = {
  async pendingTask({ page, limit, managerId }: TList & { managerId: string }) {
    const where: Prisma.TaskWhereInput = {
      status: ETaskStatus.PENDING,
      influencer: {
        influencer_managers: {
          some: {
            managerId,
            isConnected: true,
          },
        },
      },
    };

    // Run count and fetch in parallel for better performance
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        select: {
          campaign: {
            select: {
              id: true,
              banner: true,
              title: true,
              brand: true,
              description: true,
              duration: true,
              expected_metrics: true,
            },
          },
          influencer: {
            select: { avatar: true, id: true, name: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          campaign: {
            duration: 'asc', //? Ordering by nearest deadline first
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
      },
      campaigns: tasks.map(t => ({
        campaignId: t.campaign.id,
        campaignBanner: t.campaign.banner,
        campaignTitle: t.campaign.title,
        campaignBrand: t.campaign.brand,
        campaignDescription: t.campaign.description,
        campaignDeadline: t.campaign.duration,
        influencerAvatar: t.influencer.avatar,
        influencerId: t.influencer.id,
        influencerName: t.influencer.name,
        requiredMetrics: t.campaign.expected_metrics,
      })),
    };
  },
};
