import { Router } from 'express';
import { TaskControllers } from './Task.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { TaskValidations } from './Task.validation';

const subAdmin = Router();
{
  subAdmin.get(
    '/',
    purifyRequest(
      QueryValidations.list,
      TaskValidations.getAll,
      TaskValidations.superGetAll,
    ),
    TaskControllers.superGetAll,
  );

  subAdmin.post(
    '/:taskId/:status',
    purifyRequest(
      QueryValidations.exists('taskId', 'task'),
      TaskValidations.updateStatus,
    ),
    TaskControllers.updateStatus,
  );
}

export const TaskRoutes = { subAdmin };
