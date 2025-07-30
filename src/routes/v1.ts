import { Router } from 'express';
import auth from '../app/middlewares/auth';
import AdminRoutes from '../app/modules/admin/Admin.route';
import SubAdminRoutes from '../app/modules/subAdmin/SubAdmin.route';
import { AuthRoutes } from '../app/modules/auth/Auth.route';
import { UserRoutes } from '../app/modules/user/User.route';
import { StatusCodes } from 'http-status-codes';
import { CampaignRoutes } from '../app/modules/campaign/Campaign.route';

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

appRouter.inject([
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/campaigns',
    route: CampaignRoutes.talent,
  },
  {
    path: '/profile',
    middlewares: [auth()],
    route: UserRoutes.user,
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

export default appRouter;
