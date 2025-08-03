import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { ReviewControllers } from './Review.controller';
import auth from '../../middlewares/auth';

const router = Router();

router.delete(
  '/:reviewId/delete',
  purifyRequest(QueryValidations.exists('reviewId', 'review')),
  auth(),
  ReviewControllers.deleteReview,
);

export const ReviewRoutes = router;
