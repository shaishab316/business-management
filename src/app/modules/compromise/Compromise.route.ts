import { Router } from 'express';
import { CompromiseControllers } from './Compromise.controller';
import { CompromiseValidations } from './Compromise.validation';
import purifyRequest from '../../middlewares/purifyRequest';

const router = Router();

router.post(
  '/create',
  purifyRequest(CompromiseValidations.create),
  CompromiseControllers.create,
);

export const CompromiseRoutes = router;
