import { Router } from 'express';
import { NotificationControllers } from './Notification.controller';
import { NotificationValidations } from './Notification.validation';
import purifyRequest from '../../middlewares/purifyRequest';

const subAdmin = Router();

subAdmin.post(
  '/send',
  purifyRequest(NotificationValidations.send),
  NotificationControllers.send,
);

export const NotificationRoutes = { subAdmin };
