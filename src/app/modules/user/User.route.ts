import { Router } from 'express';
import { UserControllers } from './User.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { UserValidations } from './User.validation';
import capture from '../../middlewares/capture';
import { AuthControllers } from '../auth/Auth.controller';
import { ReviewValidations } from '../review/Review.validation';
import { ReviewControllers } from '../review/Review.controller';
import auth from '../../middlewares/auth';

const avatarCapture = capture({
  avatar: {
    size: 5 * 1024 * 1024,
    maxCount: 1,
  },
});

const admin = Router();
{
  admin.delete(
    '/:userId/delete',
    purifyRequest(QueryValidations.exists('userId', 'user')),
    UserControllers.delete,
  );
}

const user = Router();
{
  user.get('/', auth(), UserControllers.profile);

  user.patch(
    '/edit',
    auth(),
    avatarCapture,
    purifyRequest(UserValidations.edit),
    UserControllers.edit,
  );

  user.post(
    '/change-password',
    auth(),
    purifyRequest(UserValidations.changePassword),
    AuthControllers.changePassword,
  );

  user.post(
    '/request-for-influencer',
    auth.user(),
    capture({
      avatar: {
        size: 5 * 1024 * 1024,
        maxCount: 1,
      },
    }),
    purifyRequest(UserValidations.requestForInfluencer),
    UserControllers.requestForInfluencer,
  );
}

const subAdmin = Router();
{
  subAdmin.get(
    '/',
    purifyRequest(QueryValidations.list, UserValidations.getAllUser),
    UserControllers.getAllUser,
  );

  subAdmin.get(
    '/pending-influencers',
    purifyRequest(QueryValidations.list),
    UserControllers.getPendingInfluencers,
  );

  subAdmin.post(
    '/:influencerId/approve',
    purifyRequest(QueryValidations.exists('influencerId', 'user')),
    UserControllers.approveInfluencer,
  );

  subAdmin.post(
    '/:influencerId/decline',
    purifyRequest(QueryValidations.exists('influencerId', 'user')),
    UserControllers.declineInfluencer,
  );

  subAdmin.post(
    '/:influencerId/review',
    purifyRequest(
      QueryValidations.exists('influencerId', 'user'),
      ReviewValidations.giveReview,
    ),
    ReviewControllers.giveReview,
  );
}

export const UserRoutes = {
  admin,
  user,
  subAdmin,
};
