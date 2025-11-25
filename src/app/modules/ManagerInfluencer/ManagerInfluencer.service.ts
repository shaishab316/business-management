import { ETaskStatus, Prisma } from '../../../../prisma';
import prisma from '../../../util/prisma';
import { TPagination } from '../../../util/server/serveResponse';
import { TList } from '../query/Query.interface';
import { userSearchableFields } from '../user/User.constant';
import {
  TConnectInfluencerArgs,
  TConnectManagerArgs,
  TDisconnectManagerInfluencerArgs,
} from './ManagerInfluencer.interface';

export const ManagerInfluencerServices = {
  //? connect a manager to an influencer
  async connectManager({ managerId, influencerId }: TConnectManagerArgs) {
    const relation = await prisma.managerInfluencer.findFirst({
      where: {
        managerId,
        influencerId,
      },
    });

    if (relation) {
      if (relation.isConnected) {
        throw new Error('This manager is already connected to the influencer.');
      }

      if (relation.isManagerApproved) {
        if (!relation.isInfluencerApproved) {
          //? Both have approved, just update the connection
          return prisma.managerInfluencer.update({
            where: {
              id: relation.id,
            },
            data: {
              isConnected: true,
              connectedAt: new Date(),
              isInfluencerApproved: true,
            },
          });
        }
      }
    }

    return prisma.managerInfluencer.create({
      data: {
        managerId,
        influencerId,
        isInfluencerApproved: true,
      },
    });
  },

  //? connect an influencer to a manager
  async connectInfluencer({ influencerId, managerId }: TConnectInfluencerArgs) {
    const relation = await prisma.managerInfluencer.findFirst({
      where: {
        managerId,
        influencerId,
      },
    });

    if (relation) {
      if (relation.isConnected) {
        throw new Error('This influencer is already connected to the manager.');
      }

      if (relation.isInfluencerApproved) {
        if (!relation.isManagerApproved) {
          //? Both have approved, just update the connection
          return prisma.managerInfluencer.update({
            where: {
              id: relation.id,
            },
            data: {
              isConnected: true,
              connectedAt: new Date(),
              isManagerApproved: true,
            },
          });
        }
      }
    }

    return prisma.managerInfluencer.create({
      data: {
        managerId,
        influencerId,
        isManagerApproved: true,
      },
    });
  },

  //? disconnect manager and influencer
  async disconnect({
    influencerId,
    managerId,
  }: TDisconnectManagerInfluencerArgs) {
    return prisma.managerInfluencer.deleteMany({
      where: {
        influencerId,
        managerId,
      },
    });
  },

  //? get influencer's manager info
  async getManagerInfo(influencerId: string) {
    const relation = await prisma.managerInfluencer.findFirst({
      where: {
        influencerId,
        isConnected: true,
      },
      include: {
        manager: {
          select: {
            avatar: true,
            name: true,
            id: true,
          },
        },
      },
      orderBy: {
        connectedAt: 'desc',
      },
    });

    if (relation) {
      return relation.manager;
    }
  },

  //? get manager's influencers info
  async getInfluencersInfo({
    page,
    limit,
    search,
    managerId,
  }: TList & { managerId: string }) {
    const where: Prisma.ManagerInfluencerWhereInput = {
      managerId,
      isConnected: true,
    };

    if (search) {
      where.influencer = {
        OR: userSearchableFields.map(field => ({
          [field]: {
            contains: search,
            mode: 'insensitive',
          },
        })),
      };
    }

    const relations = await prisma.managerInfluencer.findMany({
      where,
      select: {
        influencer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            socials: true,
            Task: {
              where: {
                status: {
                  in: [ETaskStatus.ACTIVE, ETaskStatus.COMPLETED],
                },
              },
              select: {
                status: true,
              },
            },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.managerInfluencer.count({
      where,
    });

    const influencers = relations.map(
      ({ influencer: { Task, ...influencer } }) => {
        const activeCampaigns = Task.filter(
          task => task.status === ETaskStatus.ACTIVE,
        ).length;

        return {
          ...influencer,
          activeCampaigns,
          completedCampaigns: Task.length - activeCampaigns,
        };
      },
    );

    return {
      meta: {
        pagination: {
          total,
          limit,
          page,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
      },
      influencers,
    };
  },
};
