import { Router } from 'express';
import { UserControllers } from './User.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { UserValidations } from './User.validation';
import capture from '../../middlewares/capture';
import { AuthControllers } from '../auth/Auth.controller';
import { ReviewValidations } from '../review/Review.validation';
import { ReviewControllers } from '../review/Review.controller';

const admin = Router();
{
  admin.get(
    '/',
    purifyRequest(QueryValidations.list, UserValidations.list),
    UserControllers.list,
  );

  admin.delete(
    '/:userId/delete',
    purifyRequest(QueryValidations.exists('userId', 'user')),
    UserControllers.delete,
  );
}

const user = Router();
{
  user.get('/', UserControllers.profile);

  user.patch(
    '/edit',
    capture({
      avatar: {
        size: 5 * 1024 * 1024,
        maxCount: 1,
      },
    }),
    purifyRequest(UserValidations.edit),
    UserControllers.edit,
  );

  user.post(
    '/change-password',
    purifyRequest(UserValidations.changePassword),
    AuthControllers.changePassword,
  );
}

const subAdmin = Router();
{
  subAdmin.post(
    '/:talentId/review',
    purifyRequest(
      QueryValidations.exists('talentId', 'user'),
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
