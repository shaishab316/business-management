import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { ReviewServices } from './Review.service';
import { CampaignServices } from '../campaign/Campaign.service';
import { UserServices } from '../user/User.service';
import prisma from '../../../util/prisma';

export const ReviewControllers = {
  getAll: catchAsync(async ({ query }, res) => {
    const { meta, reviews } = await ReviewServices.getAll(query);

    serveResponse(res, {
      message: 'Reviews retrieved successfully!',
      meta,
      data: reviews,
    });
  }),

  giveReview: catchAsync(async ({ body, user, params }, res) => {
    const { campaignId, influencerId } = params;

    await ReviewServices.giveReview({
      ...params,
      userId: user.id,
      details: body,
    });

    let data: any = null;

    if (campaignId) {
      await CampaignServices.updateRating(campaignId);
      data = await CampaignServices.getById({
        influencerId: user.id,
        campaignId,
      });
    }

    if (influencerId) {
      await UserServices.updateRating(influencerId);
      data = await prisma.user.findFirst({
        where: {
          id: influencerId,
        },
      });
    }

    serveResponse(res, {
      message: 'Reviewed successfully!',
      data,
    });
  }),

  deleteReview: catchAsync(async ({ params, user }, res) => {
    await ReviewServices.deleteReview(params.reviewId, user.id);

    serveResponse(res, {
      message: 'Review deleted successfully!',
    });
  }),
};
