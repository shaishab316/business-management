import { Router } from 'express';
import { ManagerInfluencerRoutes } from '../managerInfluencer/ManagerInfluencer.route';
import { ManagerControllers } from './Manager.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';

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
}

export default manager;
