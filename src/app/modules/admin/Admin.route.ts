import { Router } from 'express';
import { UserRoutes } from '../user/User.route';
import { ContextPageRoutes } from '../contextPage/ContextPage.route';
import { CampaignRoutes } from '../campaign/Campaign.route';

export default Router().inject([
  {
    path: '/users',
    route: UserRoutes.admin,
  },
  {
    path: '/context-pages',
    route: ContextPageRoutes.admin,
  },
  {
    path: '/campaigns',
    route: CampaignRoutes.admin,
  },
]);
