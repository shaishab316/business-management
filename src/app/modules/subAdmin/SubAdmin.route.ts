import { Router } from 'express';
import { CampaignRoutes } from '../campaign/Campaign.route';
import { TaskRoutes } from '../task/Task.route';

export default Router().inject([
  {
    path: '/campaigns',
    route: CampaignRoutes.subAdmin,
  },
  {
    path: '/tasks',
    route: TaskRoutes.subAdmin,
  },
]);
