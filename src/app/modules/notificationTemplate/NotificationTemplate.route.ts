import { Router } from 'express';
import { NotificationTemplateControllers } from './NotificationTemplate.controller';
import { NotificationTemplateValidations } from './NotificationTemplate.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';

const router = Router();

router.get(
  '/',
  purifyRequest(QueryValidations.list, NotificationTemplateValidations.getAll),
  NotificationTemplateControllers.getAll,
);

router.get(
  '/:notificationTemplateId',
  purifyRequest(
    QueryValidations.exists('notificationTemplateId', 'notificationTemplate'),
  ),
  NotificationTemplateControllers.getById,
);

router.post(
  '/create',
  purifyRequest(NotificationTemplateValidations.create),
  NotificationTemplateControllers.create,
);

router.patch(
  '/:notificationTemplateId/edit',
  purifyRequest(
    QueryValidations.exists('notificationTemplateId', 'notificationTemplate'),
    NotificationTemplateValidations.update,
  ),
  NotificationTemplateControllers.update,
);

router.delete(
  '/:notificationTemplateId/delete',
  purifyRequest(
    QueryValidations.exists('notificationTemplateId', 'notificationTemplate'),
  ),
  NotificationTemplateControllers.delete,
);

export const NotificationTemplateRoutes = router;
