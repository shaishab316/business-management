import { StatusCodes } from 'http-status-codes';
import { Review as TReview } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import prisma from '../../../util/prisma';

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
        ...(reviewData.talentId
          ? { talentId: reviewData.talentId }
          : { campaignId: reviewData.campaignId }),
      },
    });

    const select = reviewData.talentId
      ? {
          talent: {
            select: {
              name: true,
              avatar: true,
              socials: true,
            },
          },
        }
      : {
          campaign: {
            select: {
              title: true,
              banner: true,
              duration: true,
            },
          },
        };

    if (existing) {
      return prisma.review.update({
        where: { id: existing.id },
        data: reviewData,
        select,
      });
    }

    return prisma.review.create({
      data: reviewData,
      select,
    });
  },
};
