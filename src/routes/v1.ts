import { Router } from 'express';
import auth from '../app/middlewares/auth';
import AdminRoutes from '../app/modules/admin/Admin.route';
import SubAdminRoutes from '../app/modules/subAdmin/SubAdmin.route';
import { AuthRoutes } from '../app/modules/auth/Auth.route';
import { UserRoutes } from '../app/modules/user/User.route';
import { StatusCodes } from 'http-status-codes';
import { CampaignRoutes } from '../app/modules/campaign/Campaign.route';
import { TaskRoutes } from '../app/modules/task/Task.route';
import { ReviewRoutes } from '../app/modules/review/Review.route';

const appRouter = Router();

/** Forward uploaded files requests */
['images'].map((filetype: string) =>
  appRouter.get(`/${filetype}/:filename`, (req, res) =>
    res.redirect(
      StatusCodes.MOVED_PERMANENTLY,
      `/${filetype}/${encodeURIComponent(req.params.filename)}`,
    ),
  ),
);

export default appRouter.inject([
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/campaigns',
    route: CampaignRoutes.talent,
  },
  {
    path: '/reviews',
    route: ReviewRoutes,
  },
  {
    path: '/profile',
    middlewares: [auth()],
    route: UserRoutes.user,
  },
  {
    path: '/tasks',
    middlewares: [auth.talent()],
    route: TaskRoutes.talent,
  },
  {
    path: '/sub-admin',
    middlewares: [auth.subAdmin()],
    route: SubAdminRoutes,
  },
  {
    path: '/admin',
    middlewares: [auth.admin()],
    route: AdminRoutes,
  },
]);
