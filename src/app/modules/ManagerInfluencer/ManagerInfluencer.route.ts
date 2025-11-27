import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { ManagerInfluencerValidations } from './ManagerInfluencer.validation';
import { ManagerInfluencerControllers } from './ManagerInfluencer.controller';
import { QueryValidations } from '../query/Query.validation';

const influencer = Router();
{
  //? Get manager info
  influencer.get('/', ManagerInfluencerControllers.getManagerInfo);

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

const manager = Router();
{
  //? Get influencers info
  manager.get(
    '/',
    purifyRequest(
      QueryValidations.list,
      ManagerInfluencerValidations.getInfluencersInfo,
    ),
    ManagerInfluencerControllers.getInfluencersInfo,
  );

  //? Connect to influencer
  manager.post(
    '/',
    purifyRequest(ManagerInfluencerValidations.connectInfluencer),
    ManagerInfluencerControllers.connectInfluencer,
  );

  //? Disconnect to influencer
  manager.delete(
    '/',
    purifyRequest(ManagerInfluencerValidations.disconnectInfluencer),
    ManagerInfluencerControllers.disconnect,
  );
}

export const ManagerInfluencerRoutes = { influencer, manager };
