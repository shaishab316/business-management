import { EUserRole } from '../../../../prisma';
import serveResponse from '../../../util/server/serveResponse';
import catchAsync from '../../middlewares/catchAsync';
import { TDisconnectManagerInfluencerArgs } from './ManagerInfluencer.interface';
import { ManagerInfluencerServices } from './ManagerInfluencer.service';

export const ManagerInfluencerControllers = {
  connectManager: catchAsync(async ({ body, user: influencer }, res) => {
    const relation = await ManagerInfluencerServices.connectManager({
      ...body,
      influencerId: influencer.id,
    });

    serveResponse(res, {
      message: 'Manager connected successfully!',
      data: relation,
    });
  }),

  connectInfluencer: catchAsync(async ({ body, user: manager }, res) => {
    const relation = await ManagerInfluencerServices.connectInfluencer({
      ...body,
      managerId: manager.id,
    });

    serveResponse(res, {
      message: 'Influencer connected successfully!',
      data: relation,
    });
  }),

  disconnect: catchAsync(async ({ body, user }, res) => {
    const payload: TDisconnectManagerInfluencerArgs = {
      influencerId: body.influencerId,
      managerId: user.id,
    };

    //? Swap if the user is an influencer
    if (user.role === EUserRole.INFLUENCER) {
      payload.managerId = body.managerId;
      payload.influencerId = user.id;
    }

    const relation = await ManagerInfluencerServices.disconnect(payload);

    serveResponse(res, {
      message: 'Disconnected successfully!',
      data: relation,
    });
  }),

  getManagerInfo: catchAsync(async ({ user: influencer }, res) => {
    const manager = await ManagerInfluencerServices.getManagerInfo(
      influencer.id,
    );

    serveResponse(res, {
      message: 'Manager info fetched successfully!',
      data: manager,
    });
  }),

  getInfluencersInfo: catchAsync(async ({ user: manager, query }, res) => {
    const { influencers, meta } =
      await ManagerInfluencerServices.getInfluencersInfo({
        ...query,
        managerId: manager.id,
      });

    serveResponse(res, {
      message: 'Influencers info fetched successfully!',
      meta,
      data: influencers,
    });
  }),
};
