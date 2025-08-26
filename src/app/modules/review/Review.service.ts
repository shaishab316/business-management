import { StatusCodes } from 'http-status-codes';
import { Review as TReview } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import prisma from '../../../util/prisma';
import { TList } from '../query/Query.interface';
import { TPagination } from '../../../util/server/serveResponse';

export const ReviewServices = {
  async giveReview(reviewData: TReview) {
    const reviews = Object.values(reviewData.details!);

    if (!reviews.length)
      throw new ServerError(StatusCodes.BAD_REQUEST, 'No rating provided');

    const rating = reviews.reduce((acc, cur) => acc + cur, 0) / reviews.length;

    reviewData.rating = ((rating * 10) | 0) / 10;

    const existing = await prisma.review.findFirst({
      where: {
        userId: reviewData.userId!,
        ...(reviewData.influencerId
          ? { influencerId: reviewData.influencerId }
          : { campaignId: reviewData.campaignId }),
      },
    });

    if (existing) {
      return prisma.review.update({
        where: { id: existing.id },
        data: reviewData,
      });
    }

    return prisma.review.create({
      data: reviewData,
    });
  },

  async deleteReview(reviewId: string, userId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: true,
      },
    });

    if (review?.userId !== userId)
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        `You can't delete ${review?.user?.name}'s review`,
      );

    return prisma.review.delete({ where: { id: reviewId } });
  },

  async getAll({ page, limit, influencerId, campaignId, userId }: TList) {
    const where: any = {};

    if (influencerId) where.influencerId = influencerId;
    if (campaignId) where.campaignId = campaignId;
    if (userId) where.userId = userId;

    const reviews = await prisma.review.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        campaign: true,
        influencer: true,
      },
    });

    const total = await prisma.review.count({ where });

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
      reviews,
    };
  },
};
