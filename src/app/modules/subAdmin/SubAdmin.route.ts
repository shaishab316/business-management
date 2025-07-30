import { Router } from 'express';
import { CampaignRoutes } from '../campaign/Campaign.route';

export default Router().inject([
  {
    path: '/campaigns',
    route: CampaignRoutes,
  },
]);
