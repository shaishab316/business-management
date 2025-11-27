import { StatusCodes } from 'http-status-codes';
import { ETaskStatus, Prisma, Campaign as TCampaign } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import prisma from '../../../util/prisma';
import { TPagination } from '../../../util/server/serveResponse';
import { deleteFile } from '../../middlewares/capture';
import { TList } from '../query/Query.interface';
import { TaskServices } from '../task/Task.service';
import { campaignSearchableFields as searchableFields } from './Campaign.constant';

export const CampaignServices = {
  async create(campaignData: TCampaign) {
    return prisma.campaign.create({
      data: campaignData,
      include: { Issue: true },
    });
  },

  async edit(campaignId: string, campaignData: TCampaign) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { banner: true },
    });

    // delete old banner
    if (campaignData.banner && campaign?.banner) {
      await deleteFile(campaign.banner);
    }

    return prisma.campaign.update({
      where: { id: campaignId },
      data: campaignData,
    });
  },

  async delete(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { banner: true },
    });

    if (campaign?.banner) {
      await deleteFile(campaign.banner);
    }

    return prisma.campaign.delete({ where: { id: campaignId } });
  },

  async superGetAll({ page, limit }: TList) {
    const campaigns = await prisma.campaign.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.campaign.count();

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
      },
      campaigns,
    };
  },

  async getAll({
    page,
    limit,
    influencerId,
    status,
  }: TList & { influencerId: string; status?: ETaskStatus }) {
    const where: Prisma.TaskWhereInput = { influencerId };
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      include: { campaign: true },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.task.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
        query: where,
      },
      campaigns: tasks.map(({ campaign, duration, ...task }) => ({
        ...task,
        ...campaign,
        duration,
      })),
    };
  },

  async getById(
    where: Pick<Prisma.TaskWhereInput, 'influencerId' | 'campaignId'>,
  ) {
    const task = await prisma.task.findFirst({
      where,
      include: { campaign: true },
    });

    if (!task)
      throw new ServerError(StatusCodes.NOT_FOUND, 'Campaign not found.');

    const { campaign, duration, ...taskData } = task;

    return {
      ...taskData,
      ...campaign,
      duration,
    };
  },

  async updateRating(campaignId: string) {
    const {
      _avg: { rating },
      _count,
    } = await prisma.review.aggregate({
      where: { campaignId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: { rating: rating ?? 0 },
    });

    return {
      rating: campaign.rating,
      review_count: _count.rating ?? 0,
    };
  },

  async superGetCampaigns({
    page,
    limit,
    search,
    where,
  }: TList & { where: Prisma.CampaignWhereInput }) {
    if (search) {
      where.OR = searchableFields.map(field => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }

    // Fetch campaigns with pagination
    const campaigns = await prisma.campaign.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.campaign.count({ where });

    if (campaigns.length === 0) {
      return {
        meta: {
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          query: { search },
        },
        campaigns: [],
      };
    }

    // Get unread/read issue counts per campaign using groupBy
    const issueCounts = await prisma.issue.groupBy({
      by: ['campaignId', 'unread'],
      where: {
        campaignId: { in: campaigns.map(c => c.id) },
      },
      _count: { _all: true },
    });

    // Map counts to campaigns
    const countMap: Record<string, { unread: number; read: number }> = {};
    issueCounts.forEach(item => {
      if (!countMap[item.campaignId])
        countMap[item.campaignId] = { unread: 0, read: 0 };
      if (item.unread) countMap[item.campaignId].unread = item._count._all;
      else countMap[item.campaignId].read = item._count._all;
    });

    // Attach counts to campaigns
    const result = campaigns.map(c => ({
      ...c,
      unreadIssueCount: countMap[c.id]?.unread || 0,
      readIssueCount: countMap[c.id]?.read || 0,
    }));

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        query: { search },
      },
      campaigns: result,
    };
  },

  async superGetCampaignById(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    const unreadIssueCount = await prisma.issue.count({
      where: {
        campaignId,
        unread: true,
      },
    });

    const readIssueCount = await prisma.issue.count({
      where: {
        campaignId,
        unread: false,
      },
    });

    Object.assign(campaign ?? {}, { unreadIssueCount, readIssueCount });

    return campaign;
  },

  async getCampaignInfluencers(campaignId: string) {
    const tasks = await prisma.task.findMany({
      where: {
        campaignId,
        status: {
          not: ETaskStatus.PENDING,
        },
      },
      select: {
        campaignId: true,
        campaign: {
          select: {
            expected_metrics: true,
          },
        },
        influencerId: true,
        influencer: {
          omit: {
            fcmToken: true,
          },
        },
        status: true,
        matrix: true,
      },
    });

    return tasks.map(({ matrix, campaign: { expected_metrics }, ...task }) => ({
      ...task,
      matrix: Object.fromEntries(
        Object.entries(expected_metrics ?? {}).map(([key, goal]) => [
          key,
          {
            value: (matrix as Record<string, string>)?.[key] ?? 0,
            goal,
          },
        ]),
      ),
    }));
  },

  async getCampaignInfluencerDetails({
    campaignId,
    influencerId,
  }: {
    campaignId: string;
    influencerId: string;
  }) {
    const task = await prisma.task.findFirst({
      where: { campaignId, influencerId },
      select: {
        influencer: {
          select: {
            name: true,
            avatar: true,
            rating: true,
            socials: true,
          },
        },
        id: true,
        matrix: true,
        screenshot: true,
        status: true,
        postLink: true,
        campaign: {
          select: {
            expected_metrics: true,
          },
        },
      },
    });

    if (!task)
      throw new ServerError(StatusCodes.NOT_FOUND, 'Campaign not found.');

    const {
      campaign: { expected_metrics },
      influencer,
      matrix,
      ...taskData
    } = task;

    return {
      ...taskData,
      matrix: Object.fromEntries(
        Object.entries(expected_metrics ?? {}).map(([key, goal]) => [
          key,
          {
            value: (matrix as Record<string, string>)?.[key] ?? 0,
            goal,
          },
        ]),
      ),
      influencerName: influencer.name,
      influencerAvatar: influencer.avatar,
      influencerRating: influencer.rating,
      influencerSocials: influencer.socials,
    };
  },

  async approveMetrics({
    influencerId,
    campaignId,
  }: {
    influencerId: string;
    campaignId: string;
  }) {
    const task = await TaskServices.getTask({ influencerId, campaignId });

    if (task.status === ETaskStatus.COMPLETED)
      throw new ServerError(StatusCodes.BAD_REQUEST, 'Task already approved.');

    return prisma.task.update({
      where: { id: task.id },
      data: { status: ETaskStatus.COMPLETED },
    });
  },

  async requestRevision({
    influencerId,
    campaignId,
  }: {
    influencerId: string;
    campaignId: string;
  }) {
    const task = await TaskServices.getTask({ influencerId, campaignId });

    return prisma.task.update({
      where: { id: task.id },
      data: { status: ETaskStatus.ACTIVE, matrix: null },
    });
  },
};
