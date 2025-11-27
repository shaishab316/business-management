import { StatusCodes } from 'http-status-codes';
import {
  EPaymentMethod,
  EPaymentStatus,
  ETaskStatus,
  Prisma,
} from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import prisma from '../../../util/prisma';
import { TPagination } from '../../../util/server/serveResponse';
import { TList } from '../query/Query.interface';
import {
  TManagerGetCampaignsArgs,
  TManagerGetPaymentsArgs,
  TManagerSendPaymentRequestArgs,
  TManagerSubmitPostLinkArgs,
} from './Manager.interface';
import { campaignSearchableFields } from '../campaign/Campaign.constant';

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
        statusText: 'submitted',
      },
    });

    if (result.count === 0) {
      throw new ServerError(
        StatusCodes.NOT_FOUND,
        `No task found for campaign id ${campaignId} and influencer id ${influencerId}.`,
      );
    }
  },

  async getCampaigns({
    limit,
    page,
    search,
    tab,
    managerId,
  }: TManagerGetCampaignsArgs) {
    const where: Prisma.TaskWhereInput = {
      influencer: {
        influencer_managers: {
          some: {
            managerId,
            isConnected: true,
          },
        },
      },
    };

    if (tab === 'active') {
      where.status = ETaskStatus.ACTIVE;
    } else if (tab === 'completed') {
      where.status = ETaskStatus.COMPLETED;
    }

    if (search) {
      where.campaign = {
        OR: campaignSearchableFields.map(field => ({
          [field]: {
            contains: search,
            mode: 'insensitive',
          },
        })),
      };
    }

    const tasks = await prisma.task.findMany({
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
        statusText: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        campaign: {
          duration: 'asc', // Ordering by nearest deadline first
        },
      },
    });

    const total = await prisma.task.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
        query: {
          search,
          tab,
        },
      },
      campaigns: tasks.map(t => ({
        campaignId: t.campaign.id,
        campaignBanner: t.campaign.banner,
        campaignTitle: t.campaign.title,
        campaignBrand: t.campaign.brand,
        campaignDescription: t.campaign.description,
        campaignDeadline: t.campaign.duration,
        requiredMetrics: t.campaign.expected_metrics,
        influencerAvatar: t.influencer.avatar,
        influencerId: t.influencer.id,
        influencerName: t.influencer.name,
        status: t.statusText ?? 'unavailable',
      })),
    };
  },

  async getCampaignDetails(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        tasks: {
          include: {
            influencer: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    if (!campaign) {
      throw new ServerError(
        StatusCodes.NOT_FOUND,
        `No campaign found with id ${campaignId}.`,
      );
    }

    const task = campaign.tasks[0];

    return {
      campaignId: campaign.id,
      campaignBanner: campaign.banner,
      campaignTitle: campaign.title,
      campaignBrand: campaign.brand,
      campaignBudget: campaign.budget,
      campaignDescription: campaign.description,
      campaignDeadline: campaign.duration,
      requiredMetrics: campaign.expected_metrics,
      otherFields: campaign.other_fields,
      influencerId: task?.influencer.id || null,
      influencerName: task?.influencer.name || null,
      influencerAvatar: task?.influencer.avatar || null,
      status: task?.statusText || 'unavailable',
    };
  },

  async sendPaymentRequest({
    campaignId,
    influencerId,
    managerId,
    method,
    invoices,
  }: TManagerSendPaymentRequestArgs) {
    const task = await prisma.task.findFirst({
      where: {
        campaignId,
        influencerId,
      },
      select: {
        id: true,
        budget: true,
      },
    });

    if (!task) {
      throw new ServerError(
        StatusCodes.NOT_FOUND,
        `No task found for campaign id ${campaignId} and influencer id ${influencerId}.`,
      );
    }

    //? ensure no existing payment request for the same task and influencer
    const existingPayment = await prisma.payment.findFirst({
      where: {
        taskId: task.id,
        status: { not: EPaymentStatus.CANCEL },
      },
    });

    if (existingPayment) {
      throw new ServerError(
        StatusCodes.CONFLICT,
        'Payment request has already been sent for this task.',
      );
    }

    const payload: Prisma.PaymentCreateArgs['data'] = {
      influencerId,
      method,
      amount: task.budget,
      taskId: task.id,

      //? Marking payment as manager initiated
      managerId,
      isCompletedByManager: true,
    };

    //? If payment method is invoice, invoices must be provided
    if (method === EPaymentMethod.INVOICE) {
      if (!invoices?.length) {
        throw new ServerError(StatusCodes.BAD_REQUEST, 'Invoices is required!');
      }

      payload.invoices = invoices;
    }

    return prisma.payment.create({
      data: payload,
    });
  },

  async getPayments({
    limit,
    page,
    search,
    tab,
    managerId,
  }: TManagerGetPaymentsArgs) {
    const where: Prisma.TaskWhereInput = {
      influencer: {
        influencer_managers: {
          some: {
            managerId,
            isConnected: true,
          },
        },
      },
      isPaymentDone: tab === 'paid',
    };

    if (search) {
      where.campaign = {
        OR: campaignSearchableFields.map(field => ({
          [field]: {
            contains: search,
            mode: 'insensitive',
          },
        })),
      };
    }

    const tasks = await prisma.task.findMany({
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
            budget: true,
            payout_deadline: true,
          },
        },
        influencer: {
          select: { avatar: true, id: true, name: true },
        },
        Payment: {
          //? ensure payment is not cancelled
          where: {
            status: { not: EPaymentStatus.CANCEL },
          },
          select: {
            id: true,
          },
        },
        isPaymentDone: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        campaign: {
          duration: 'asc', //? Ordering by nearest deadline first
        },
      },
    });

    const total = await prisma.task.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
        query: {
          search,
          tab,
        },
      },
      campaigns: tasks.map(t => ({
        campaignId: t.campaign.id,
        campaignBanner: t.campaign.banner,
        campaignTitle: t.campaign.title,
        campaignBrand: t.campaign.brand,
        campaignDescription: t.campaign.description,
        campaignDeadline: t.campaign.duration,
        campaignPayoutDeadline: t.campaign.payout_deadline,
        campaignBudget: (t.campaign.budget * 0.1).toFixed(2), //? assuming manager gets 10% cut
        requiredMetrics: t.campaign.expected_metrics,
        influencerAvatar: t.influencer.avatar,
        influencerId: t.influencer.id,
        influencerName: t.influencer.name,
        isPaymentRequested: t.isPaymentDone || Boolean(t.Payment?.length),
        isPaymentDone: t.isPaymentDone,
      })),
    };
  },

  async getPaymentDetails(campaignId: string) {
    const task = await prisma.task.findFirst({
      where: { campaignId },
      select: {
        matrix: true,
        campaign: {
          select: {
            id: true,
            banner: true,
            title: true,
            brand: true,
            description: true,
            budget: true,
          },
        },
        Payment: {
          select: { status: true, updatedAt: true },
        },
      },
    });

    if (!task) {
      throw new ServerError(
        StatusCodes.NOT_FOUND,
        `No task found for campaign id ${campaignId}.`,
      );
    }

    return {
      campaignId: task.campaign.id,
      campaignBanner: task.campaign.banner,
      campaignTitle: task.campaign.title,
      campaignBrand: task.campaign.brand,
      campaignBudget: (task.campaign.budget * 0.1).toFixed(2), //? assuming manager gets 10% cut
      campaignDescription: task.campaign.description,
      performanceMetrics: task.matrix ?? {},
      isPaymentDone: task.Payment[0]?.status === EPaymentStatus.PAID,
      paymentDoneAt:
        task.Payment[0]?.status === EPaymentStatus.PAID
          ? task.Payment[0]?.updatedAt
          : null,
    };
  },

  async getEarnings(managerId: string) {
    const [pendingEarnings, paidEarnings] = await Promise.all([
      prisma.task.aggregate({
        _sum: {
          budget: true,
        },
        where: {
          influencer: {
            influencer_managers: {
              some: {
                managerId,
                isConnected: true,
              },
            },
          },
          status: 'COMPLETED',
          isPaymentDone: false,
        },
      }),

      prisma.task.aggregate({
        _sum: {
          budget: true,
        },
        where: {
          influencer: {
            influencer_managers: {
              some: {
                managerId,
                isConnected: true,
              },
            },
          },
          status: 'COMPLETED',
          isPaymentDone: true,
        },
      }),
    ]);

    const pending = pendingEarnings?._sum?.budget ?? 0;
    const paid = paidEarnings?._sum?.budget ?? 0;

    return {
      pending: (pending * 0.1).toFixed(2), //? assuming manager gets 10% cut
      paid: (paid * 0.1).toFixed(2), //? assuming manager gets 10% cut
      total: ((pending + paid) * 0.1).toFixed(2), //? assuming manager gets 10% cut
    };
  },
};
