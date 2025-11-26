import serveResponse from '../../../util/server/serveResponse';
import catchAsync from '../../middlewares/catchAsync';
import { ManagerServices } from './Manager.service';

export const ManagerControllers = {
  pendingTask: catchAsync(async ({ query, user: manager }, res) => {
    const { meta, campaigns } = await ManagerServices.pendingTask({
      ...query,
      managerId: manager.id,
    });

    serveResponse(res, {
      message: 'Influencer Campaigns fetched successfully!',
      meta,
      data: campaigns,
    });
  }),
};
