import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { CompromiseServices } from './Compromise.service';

export const CompromiseControllers = {
  compromise: catchAsync(async ({ body, user, params }, res) => {
    const data = await CompromiseServices.compromise({
      ...body,
      influencerId: user.id,
      notificationId: params.notificationId,
    });

    serveResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: 'Compromise created successfully!',
      data,
    });
  }),

  getAll: catchAsync(async ({ query, user }, res) => {
    const { meta, compromises } = await CompromiseServices.getAll({
      ...query,
      influencerId: user.id,
    });

    serveResponse(res, {
      message: 'Compromises retrieved successfully!',
      meta,
      data: compromises,
    });
  }),

  superGetAll: catchAsync(async ({ query }, res) => {
    const { meta, compromises } = await CompromiseServices.getAll(query);

    serveResponse(res, {
      message: 'Compromises retrieved successfully!',
      meta,
      data: compromises.map(({ influencer, notification, date, id }) => ({
        id,
        date,
        influencerName: influencer.name,
        influencerAvatar: influencer.avatar,
        influencerRating: influencer.rating,
        notificationTitle: notification.title,
      })),
    });
  }),
};
