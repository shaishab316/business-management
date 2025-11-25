import { EUserRole } from '../../../../prisma';
import serveResponse from '../../../util/server/serveResponse';
import catchAsync from '../../middlewares/catchAsync';
import { TDisconnectManagerInfluencerArgs } from './ManagerInfluencer.interface';
import { ManagerInfluencerServices } from './ManagerInfluencer.service';

export const ManagerInfluencerControllers = {
  inviteManager: catchAsync(async ({ body, user: influencer }, res) => {
    const relation = await ManagerInfluencerServices.inviteManager({
      ...body,
      influencerId: influencer.id,
    });

    serveResponse(res, {
      message: 'Manager invited successfully!',
      data: relation,
    });
  }),

  inviteInfluencer: catchAsync(async ({ body, user: manager }, res) => {
    const relation = await ManagerInfluencerServices.inviteInfluencer({
      ...body,
      managerId: manager.id,
    });

    serveResponse(res, {
      message: 'Influencer invited successfully!',
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
};
