import { Router } from 'express';
import { PaymentControllers } from './Payment.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { PaymentValidations } from './Payment.validation';
import { QueryValidations } from '../query/Query.validation';

const subAdmin = Router();
{
  subAdmin.get(
    '/',
    purifyRequest(QueryValidations.list, PaymentValidations.getAll),
    PaymentControllers.superGetAll,
  );

  subAdmin.post(
    '/:paymentId/:status',
    purifyRequest(PaymentValidations.changeStatus),
    PaymentControllers.changeStatus,
  );
}

const influencer = Router();
{
  influencer.get(
    '/',
    purifyRequest(QueryValidations.list, PaymentValidations.getAll),
    PaymentControllers.getAll,
  );
}

export const PaymentRoutes = { subAdmin };
