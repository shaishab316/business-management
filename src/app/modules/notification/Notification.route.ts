import { Router } from 'express';
import { NotificationControllers } from './Notification.controller';
import { NotificationValidations } from './Notification.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import { NotificationTemplateValidations } from '../notificationTemplate/NotificationTemplate.validation';
import { NotificationTemplateRoutes } from '../notificationTemplate/NotificationTemplate.route';

const subAdmin = Router();
{
  subAdmin.use('/templates', NotificationTemplateRoutes);

  subAdmin.post(
    '/send',
    purifyRequest(
      NotificationValidations.send,
      NotificationTemplateValidations.create,
    ),
    NotificationControllers.send,
  );
}

export const NotificationRoutes = { subAdmin };
