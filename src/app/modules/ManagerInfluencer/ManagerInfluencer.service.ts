import prisma from '../../../util/prisma';
import {
  TDisconnectManagerInfluencerArgs,
  TInviteInfluencerArgs,
  TInviteManagerArgs,
} from './ManagerInfluencer.interface';

export const ManagerInfluencerServices = {
  async inviteManager({ managerId, influencerId }: TInviteManagerArgs) {
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

  async inviteInfluencer({ influencerId, managerId }: TInviteInfluencerArgs) {
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

  async disconnect({
    influencerId,
    managerId,
  }: TDisconnectManagerInfluencerArgs) {
    const relation = await prisma.managerInfluencer.findFirst({
      where: {
        managerId,
        influencerId,
        isConnected: true,
      },
    });

    if (!relation) {
      throw new Error(
        'No active connection found between the influencer and manager.',
      );
    }

    return prisma.managerInfluencer.update({
      where: {
        id: relation.id,
      },
      data: {
        isConnected: false,
        disconnectedAt: new Date(),
      },
    });
  },

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
    });

    if (relation) {
      return relation.manager;
    }
  },
};
