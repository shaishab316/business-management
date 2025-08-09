import { Router } from 'express';
import { NotificationControllers } from './Notification.controller';
import { NotificationValidations } from './Notification.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import { NotificationTemplateValidations } from '../notificationTemplate/NotificationTemplate.validation';
import { NotificationTemplateRoutes } from '../notificationTemplate/NotificationTemplate.route';
import { CompromiseValidations } from '../compromise/Compromise.validation';
import { CompromiseControllers } from '../compromise/Compromise.controller';

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

const influencer = Router();
{
  influencer.post(
    '/:notificationId/compromise',
    purifyRequest(CompromiseValidations.create),
    CompromiseControllers.create,
  );
}

export const NotificationRoutes = { subAdmin, influencer };
