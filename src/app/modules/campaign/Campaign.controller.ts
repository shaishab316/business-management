import { StatusCodes } from 'http-status-codes';
import serveResponse from '../../../util/server/serveResponse';
import { CampaignServices } from './Campaign.service';
import catchAsync from '../../middlewares/catchAsync';
import { TaskServices } from '../task/Task.service';

export const CampaignControllers = {
  create: catchAsync(async (req, res) => {
    const data = await CampaignServices.create(req.body);

    serveResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: 'Campaign created successfully!',
      data,
    });
  }),

  edit: catchAsync(async ({ params, body }, res) => {
    const data = await CampaignServices.edit(params.campaignId, body);

    serveResponse(res, {
      message: 'Campaign updated successfully!',
      data,
    });
  }),

  delete: catchAsync(async ({ params }, res) => {
    await CampaignServices.delete(params.campaignId);

    serveResponse(res, {
      message: 'Campaign deleted successfully!',
    });
  }),

  superGetAll: catchAsync(async ({ query }, res) => {
    const { campaigns, meta } = await CampaignServices.superGetAll(query);

    serveResponse(res, {
      message: 'Campaigns fetched successfully!',
      meta,
      data: campaigns,
    });
  }),

  getAll: catchAsync(async ({ query, user }, res) => {
    const { campaigns, meta } = await CampaignServices.getAll({
      ...query,
      influencerId: user.id,
    });

    serveResponse(res, {
      message: 'Influencer Campaigns fetched successfully!',
      meta,
      data: campaigns,
    });
  }),

  getById: catchAsync(async ({ params, user }, res) => {
    const data = await CampaignServices.getById({
      influencerId: user.id,
      campaignId: params.campaignId,
    });

    serveResponse(res, {
      message: 'Campaign fetched successfully!',
      data,
    });
  }),

  analytics: catchAsync(async ({ query }, res) => {
    const { campaigns, meta } = await TaskServices.analytics(query);

    serveResponse(res, {
      message: 'Campaign analytics fetched successfully!',
      meta,
      data: campaigns,
    });
  }),

  activeCampaigns: catchAsync(async ({ query }, res) => {
    const { campaigns, meta } = await CampaignServices.superGetCampaigns({
      ...query,
      where: {
        duration: {
          gte: new Date(),
        },
      },
    });

    serveResponse(res, {
      message: 'Active Campaigns fetched successfully!',
      meta,
      data: campaigns,
    });
  }),

  completedCampaigns: catchAsync(async ({ query }, res) => {
    const { campaigns, meta } = await CampaignServices.superGetCampaigns({
      ...query,
      where: {
        duration: {
          lt: new Date(),
        },
      },
    });

    serveResponse(res, {
      message: 'Completed Campaigns fetched successfully!',
      meta,
      data: campaigns,
    });
  }),

  superGetCampaignById: catchAsync(async ({ params }, res) => {
    const data = await CampaignServices.superGetCampaignById(params.campaignId);

    serveResponse(res, {
      message: 'Campaign fetched successfully!',
      data,
    });
  }),
};
