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

  submitPostLink: catchAsync(async ({ body, user: manager }, res) => {
    await ManagerServices.submitPostLink({
      ...body,
      managerId: manager.id,
    });

    serveResponse(res, {
      message: 'Post link submitted successfully!',
    });
  }),

  getCampaigns: catchAsync(async ({ query, user: manager }, res) => {
    const { meta, campaigns } = await ManagerServices.getCampaigns({
      ...query,
      managerId: manager.id,
    });

    serveResponse(res, {
      message: 'Campaigns fetched successfully!',
      meta,
      data: campaigns,
    });
  }),
};
