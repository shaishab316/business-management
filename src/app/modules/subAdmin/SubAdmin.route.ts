import { Router } from 'express';
import { CampaignRoutes } from '../campaign/Campaign.route';
import { TaskRoutes } from '../task/Task.route';
import { UserRoutes } from '../user/User.route';
import { NotificationRoutes } from '../notification/Notification.route';
import { CompromiseRoutes } from '../compromise/Compromise.route';
import { PaymentRoutes } from '../payment/Payment.route';
import { IssueRoutes } from '../issue/Issue.route';

export default Router().inject([
  {
    path: '/campaigns',
    route: CampaignRoutes.subAdmin,
  },
  {
    path: '/tasks',
    route: TaskRoutes.subAdmin,
  },
  {
    path: '/influencers',
    route: UserRoutes.subAdmin,
  },
  {
    path: '/notifications',
    route: NotificationRoutes.subAdmin,
  },
  {
    path: '/compromises',
    route: CompromiseRoutes.subAdmin,
  },
  {
    path: '/payments',
    route: PaymentRoutes.subAdmin,
  },
  {
    path: '/issues',
    route: IssueRoutes.subAdmin,
  },
]);
