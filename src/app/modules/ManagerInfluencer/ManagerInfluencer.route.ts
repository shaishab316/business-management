import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { ManagerInfluencerValidations } from './ManagerInfluencer.validation';
import { ManagerInfluencerControllers } from './ManagerInfluencer.controller';

const influencer = Router();
{
  influencer.post(
    '/invite-manager',
    purifyRequest(ManagerInfluencerValidations.inviteManager),
    ManagerInfluencerControllers.inviteManager,
  );

  influencer.post(
    '/disconnect',
    purifyRequest(ManagerInfluencerValidations.disconnectManager),
    ManagerInfluencerControllers.disconnect,
  );
}

//TODO: Add manager routes

export const ManagerInfluencerRoutes = { influencer };
