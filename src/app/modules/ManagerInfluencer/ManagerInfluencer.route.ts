import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { ManagerInfluencerValidations } from './ManagerInfluencer.validation';
import { ManagerInfluencerControllers } from './ManagerInfluencer.controller';
import { QueryValidations } from '../query/Query.validation';

const influencer = Router();
{
  //? Get manager info
  influencer.get(
    '/',
    purifyRequest(QueryValidations.list),
    ManagerInfluencerControllers.getManagerInfo,
  );

  //? Connect to manager
  influencer.post(
    '/',
    purifyRequest(ManagerInfluencerValidations.connectManager),
    ManagerInfluencerControllers.connectManager,
  );

  //? Disconnect to manager
  influencer.delete(
    '/',
    purifyRequest(ManagerInfluencerValidations.disconnectManager),
    ManagerInfluencerControllers.disconnect,
  );
}

//TODO: Add manager routes

export const ManagerInfluencerRoutes = { influencer };
