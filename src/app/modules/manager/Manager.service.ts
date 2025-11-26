import { StatusCodes } from 'http-status-codes';
import { ETaskStatus, Prisma } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import prisma from '../../../util/prisma';
import { TPagination } from '../../../util/server/serveResponse';
import { TList } from '../query/Query.interface';
import { TManagerSubmitPostLinkArgs } from './Manager.interface';

export const ManagerServices = {
  async pendingTask({ page, limit, managerId }: TList & { managerId: string }) {
    // Reuse common relation filters and parallelize all independent queries
    const baseTaskWhere: Prisma.TaskWhereInput = {
      influencer: {
        influencer_managers: {
          some: {
            managerId,
            isConnected: true,
          },
        },
      },
    };

    const pendingWhere: Prisma.TaskWhereInput = {
      ...baseTaskWhere,
      status: ETaskStatus.PENDING,
    };

    const [
      [tasks, total],
      activeCampaigns,
      completeMetrics,
      totalMetrics,
      connectedInfluencers,
    ] = await Promise.all([
      Promise.all([
        prisma.task.findMany({
          where: pendingWhere,
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
              duration: 'asc', // Ordering by nearest deadline first
            },
          },
        }),
        prisma.task.count({ where: pendingWhere }),
      ]),
      prisma.task.count({
        where: { ...baseTaskWhere, status: ETaskStatus.ACTIVE },
      }),
      prisma.task.count({ where: { ...baseTaskWhere, matrix: { not: {} } } }),
      prisma.task.count({ where: baseTaskWhere }),
      prisma.user.count({
        where: {
          influencer_managers: {
            some: {
              managerId,
              isConnected: true,
            },
          },
        },
      }),
    ]);

    const pendingMetrics = totalMetrics - completeMetrics;

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
        activeCampaigns,
        pendingMetrics,
        connectedInfluencers,
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

  async submitPostLink({
    campaignId,
    postLink,
    managerId,
    influencerId,
  }: TManagerSubmitPostLinkArgs) {
    const result = await prisma.task.updateMany({
      where: { campaignId, influencerId },
      data: {
        postLink,
        isCompletedByManager: true,
        managerId,
      },
    });

    if (result.count === 0) {
      throw new ServerError(
        StatusCodes.NOT_FOUND,
        `No task found for campaign id ${campaignId} and influencer id ${influencerId}.`,
      );
    }
  },
};
