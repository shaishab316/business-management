import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { ReviewControllers } from './Review.controller';
import { ReviewValidations } from './Review.validation';

const router = Router();

router.get(
  '/',
  purifyRequest(QueryValidations.list, ReviewValidations.getAll),
  ReviewControllers.getAll,
);

router.delete(
  '/:reviewId/delete',
  purifyRequest(QueryValidations.exists('reviewId', 'review')),
  ReviewControllers.deleteReview,
);

export const ReviewRoutes = router;
