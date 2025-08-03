import { Campaign as TCampaign } from '../../../../prisma';
import prisma from '../../../util/prisma';
import { TPagination } from '../../../util/server/serveResponse';
import { deleteImage } from '../../middlewares/capture';
import { TList } from '../query/Query.interface';

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
    if (campaignData.banner) campaign?.banner?._pipe(deleteImage);

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

    campaign?.banner?._pipe(deleteImage); // delete banner

    return prisma.campaign.delete({ where: { id: campaignId } });
  },

  async getAll({ page, limit }: TList) {
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

  async getById(campaignId: string) {
    return prisma.campaign.findUnique({ where: { id: campaignId } });
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
};
