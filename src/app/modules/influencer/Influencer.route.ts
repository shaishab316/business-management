import { Router } from 'express';
import { NotificationRoutes } from '../notification/Notification.route';
import { CampaignRoutes } from '../campaign/Campaign.route';
import { ReviewRoutes } from '../review/Review.route';
import { CompromiseRoutes } from '../compromise/Compromise.route';
import { PaymentRoutes } from '../payment/Payment.route';

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
    path: '/notifications',
    route: NotificationRoutes.influencer,
  },
  {
    path: '/compromises',
    route: CompromiseRoutes.influencer,
  },
  {
    path: '/payments',
    route: PaymentRoutes.influencer,
  },
]);
