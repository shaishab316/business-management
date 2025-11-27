import serveResponse from '../../../util/server/serveResponse';
import catchAsync from '../../middlewares/catchAsync';
import { TaskServices } from '../task/Task.service';
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

  getCampaignDetails: catchAsync(async ({ params }, res) => {
    const campaign = await ManagerServices.getCampaignDetails(
      params.campaignId,
    );

    serveResponse(res, {
      message: 'Campaign details fetched successfully!',
      data: campaign,
    });
  }),

  uploadMatrix: catchAsync(
    async ({ body: { campaignId, influencerId, ...payload } }, res) => {
      await TaskServices.uploadMatrix(
        {
          campaignId,
          influencerId,
        },
        payload,
      );

      serveResponse(res, {
        message: 'Matrix uploaded successfully!',
        data: payload,
      });
    },
  ),

  sendPaymentRequest: catchAsync(async ({ body, user: manager }, res) => {
    const payment = await ManagerServices.sendPaymentRequest({
      ...body,
      managerId: manager.id,
    });

    serveResponse(res, {
      message: 'Payment request sent successfully!',
      data: payment,
    });
  }),

  getPayments: catchAsync(async ({ query, user: manager }, res) => {
    const { meta, campaigns } = await ManagerServices.getPayments({
      ...query,
      managerId: manager.id,
    });

    serveResponse(res, {
      message: 'Payments fetched successfully!',
      meta,
      data: campaigns,
    });
  }),

  getPaymentDetails: catchAsync(async ({ params }, res) => {
    const data = await ManagerServices.getPaymentDetails(params.campaignId);

    serveResponse(res, {
      message: 'Payment details fetched successfully!',
      data,
    });
  }),
};
