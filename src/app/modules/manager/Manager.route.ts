import { Router } from 'express';
import { ManagerInfluencerRoutes } from '../managerInfluencer/ManagerInfluencer.route';
import { ManagerControllers } from './Manager.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { ManagerValidations } from './Manager.validation';

const manager = Router().inject([
  {
    path: '/influencers',
    route: ManagerInfluencerRoutes.manager,
  },
]);
{
  manager.get(
    '/pending-tasks',
    purifyRequest(QueryValidations.list),
    ManagerControllers.pendingTask,
  );

  manager.get(
    '/campaigns',
    purifyRequest(QueryValidations.list, ManagerValidations.getCampaigns),
    ManagerControllers.getCampaigns,
  );

  manager.post(
    '/submit-post-link',
    purifyRequest(ManagerValidations.submitPostLink),
    ManagerControllers.submitPostLink,
  );
}

export default manager;
