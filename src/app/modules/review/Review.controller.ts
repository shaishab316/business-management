import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { ReviewServices } from './Review.service';
import { CampaignServices } from '../campaign/Campaign.service';
import { UserServices } from '../user/User.service';

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
    const data: any = await ReviewServices.giveReview({
      ...params,
      userId: user.id,
      details: body,
    });

    if (params.campaignId)
      data.updatedCampaign = await CampaignServices.updateRating(
        params.campaignId,
      );

    if (params.influencerId)
      data.updatedInfluencer = await UserServices.updateRating(
        params.influencerId,
      );

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
