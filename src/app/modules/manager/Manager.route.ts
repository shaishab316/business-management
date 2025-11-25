import { Router } from 'express';
import { ManagerInfluencerRoutes } from '../managerInfluencer/ManagerInfluencer.route';

export default Router().inject([
  {
    path: '/influencers',
    route: ManagerInfluencerRoutes.manager,
  },
]);
