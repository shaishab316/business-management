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
    PaymentControllers.getAll,
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
    '/pending-payment',
    purifyRequest(QueryValidations.list),
    PaymentControllers.pendingPayment,
  );

  influencer.get(
    '/paid-payment',
    purifyRequest(QueryValidations.list),
    PaymentControllers.paidPayment,
  );

  influencer.get('/get-earnings', PaymentControllers.getEarnings);
}

export const PaymentRoutes = { subAdmin, influencer };
