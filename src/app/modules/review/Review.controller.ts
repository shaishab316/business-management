import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { ReviewServices } from './Review.service';

export const ReviewControllers = {
  giveReview: catchAsync(async ({ body, user, params }, res) => {
    const data = await ReviewServices.giveReview({
      ...params,
      userId: user.id,
      details: body,
    });

    serveResponse(res, {
      message: 'Reviewed successfully!',
      data,
    });
  }),
};
