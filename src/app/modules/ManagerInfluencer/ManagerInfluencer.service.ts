import { StatusCodes } from 'http-status-codes';
import { ENotificationType, ETaskStatus, Prisma } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import prisma from '../../../util/prisma';
import { TPagination } from '../../../util/server/serveResponse';
import { userSearchableFields } from '../user/User.constant';
import {
  TConnectInfluencerArgs,
  TConnectManagerArgs,
  TDisconnectManagerInfluencerArgs,
  TGetInfluencersInfoArgs,
} from './ManagerInfluencer.interface';

export const ManagerInfluencerServices = {
  //? connect a manager to an influencer
  async connectManager({ managerId, influencer }: TConnectManagerArgs) {
    const relation = await prisma.managerInfluencer.findFirst({
      where: {
        managerId,
        influencerId: influencer.id,
      },
    });

    if (relation) {
      if (relation.isConnected) {
        throw new ServerError(
          StatusCodes.BAD_REQUEST,
          'This manager is already connected to the influencer.',
        );
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
      } else {
        throw new ServerError(
          StatusCodes.BAD_REQUEST,
          'Connection request already sent.',
        );
      }
    }

    //? Create notification for the manager
    await prisma.notification.create({
      data: {
        title: 'New Influencer Connection Request',
        body: `${influencer.name} has requested to connect with you as your influencer.`,
        recipientId: managerId,
        type: ENotificationType.CONNECTION_REQUEST,
        userId: influencer.id,
        icon: influencer.avatar,
        isConnectionApproved: false,
      },
    });

    return prisma.managerInfluencer.create({
      data: {
        managerId,
        influencerId: influencer.id,
        isInfluencerApproved: true,
      },
    });
  },

  //? connect an influencer to a manager
  async connectInfluencer({ influencerId, manager }: TConnectInfluencerArgs) {
    const relation = await prisma.managerInfluencer.findFirst({
      where: {
        managerId: manager.id,
        influencerId,
      },
    });

    if (relation) {
      if (relation.isConnected) {
        throw new ServerError(
          StatusCodes.BAD_REQUEST,
          'You are already connected to this manager.',
        );
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
      } else {
        throw new ServerError(
          StatusCodes.BAD_REQUEST,
          'Connection request already sent.',
        );
      }
    }

    //? Create notification for the influencer
    await prisma.notification.create({
      data: {
        title: 'New Manager Connection Request',
        body: `${manager.name} has requested to connect with you as your manager.`,
        recipientId: influencerId,
        type: ENotificationType.CONNECTION_REQUEST,
        userId: manager.id,
        icon: manager.avatar,
        isConnectionApproved: false,
      },
    });

    return prisma.managerInfluencer.create({
      data: {
        managerId: manager.id,
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
        influencer: {
          select: {
            Task: {
              select: {
                status: true,
              },
            },
          },
        },
      },
      orderBy: {
        connectedAt: 'desc',
      },
    });

    if (relation) {
      const activeCampaigns = relation.influencer.Task.filter(
        task => task.status === ETaskStatus.ACTIVE,
      ).length;

      return {
        ...relation.manager,
        activeCampaigns,
        completedCampaigns: relation.influencer.Task.length - activeCampaigns,
      };
    }
  },

  //? get manager's influencers info
  async getInfluencersInfo({
    page,
    limit,
    search,
    managerId,
  }: TGetInfluencersInfoArgs) {
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

  async getAvailableInfluencers({
    page,
    limit,
    search,
    managerId,
  }: TGetInfluencersInfoArgs) {
    const whereUser: Prisma.UserWhereInput = {
      role: 'INFLUENCER',
      NOT: {
        influencer_managers: {
          some: {
            managerId,
          },
        },
      },
    };

    if (search) {
      whereUser.OR = userSearchableFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    const influencers = await prisma.user.findMany({
      where: whereUser,
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
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.user.count({
      where: whereUser,
    });

    const formattedInfluencers = influencers.map(({ Task, ...influencer }) => {
      const activeCampaigns = Task.filter(
        task => task.status === ETaskStatus.ACTIVE,
      ).length;

      return {
        ...influencer,
        activeCampaigns,
        completedCampaigns: Task.length - activeCampaigns,
      };
    });

    return {
      meta: {
        pagination: {
          total,
          limit,
          page,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
      },
      influencers: formattedInfluencers,
    };
  },
};
