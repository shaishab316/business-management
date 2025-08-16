import { Router } from 'express';
import { PaymentControllers } from './Payment.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { PaymentValidations } from './Payment.validation';

const subAdmin = Router();
{
  subAdmin.post(
    '/:taskId/:status',
    purifyRequest(PaymentValidations.changeStatus),
    PaymentControllers.changeStatus,
  );
}

export const PaymentRoutes = { subAdmin };
