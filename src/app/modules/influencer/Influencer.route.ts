import { Router } from 'express';
import { TaskRoutes } from '../task/Task.route';
import { NotificationRoutes } from '../notification/Notification.route';
import { CampaignRoutes } from '../campaign/Campaign.route';
import { ReviewRoutes } from '../review/Review.route';
import { CompromiseRoutes } from '../compromise/Compromise.route';

export default Router().inject([
  {
    path: '/campaigns',
    route: CampaignRoutes.influencer,
  },
  {
    path: '/reviews',
    route: ReviewRoutes,
  },
  {
    path: '/tasks',
    route: TaskRoutes.influencer,
  },
  {
    path: '/notifications',
    route: NotificationRoutes.influencer,
  },
  {
    path: '/compromises',
    route: CompromiseRoutes.influencer,
  },
]);
