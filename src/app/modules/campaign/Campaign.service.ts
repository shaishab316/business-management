import { StatusCodes } from 'http-status-codes';
import { ETaskStatus, Prisma, Campaign as TCampaign } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import prisma from '../../../util/prisma';
import { TPagination } from '../../../util/server/serveResponse';
import { deleteImage } from '../../middlewares/capture';
import { TList } from '../query/Query.interface';
import { TaskServices } from '../task/Task.service';

export const CampaignServices = {
  async create(campaignData: TCampaign) {
    return prisma.campaign.create({ data: campaignData });
  },

  async edit(campaignId: string, campaignData: TCampaign) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { banner: true },
    });

    // delete old banner
    if (campaignData.banner) campaign?.banner?.__pipes(deleteImage);

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

    campaign?.banner?.__pipes(deleteImage); // delete banner

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
    where,
  }: TList & { where: Prisma.CampaignWhereInput }) {
    const campaigns = await prisma.campaign.findMany({ where });

    const total = await prisma.campaign.count({ where });

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

  async superGetCampaignById(campaignId: string) {
    return prisma.campaign.findUnique({ where: { id: campaignId } });
  },

  async getCampaignInfluencers(campaignId: string) {
    const tasks = await prisma.task.findMany({
      where: { campaignId },
      include: {
        influencer: true,
      },
    });

    return tasks.map(({ influencer, ...task }) => ({
      ...task,
      ...influencer,
    }));
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
