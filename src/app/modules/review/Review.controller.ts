import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { ReviewServices } from './Review.service';
import { CampaignServices } from '../campaign/Campaign.service';

export const ReviewControllers = {
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

    serveResponse(res, {
      message: 'Reviewed successfully!',
      data,
    });
  }),
};
