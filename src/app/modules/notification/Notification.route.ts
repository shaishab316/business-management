import { Router } from 'express';
import { NotificationControllers } from './Notification.controller';
import { NotificationValidations } from './Notification.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import { NotificationTemplateValidations } from '../notificationTemplate/NotificationTemplate.validation';

const subAdmin = Router();

subAdmin.post(
  '/send',
  purifyRequest(
    NotificationValidations.send,
    NotificationTemplateValidations.create,
  ),
  NotificationControllers.send,
);

export const NotificationRoutes = { subAdmin };
