import { Router } from 'express';
import { TaskControllers } from './Task.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { TaskValidations } from './Task.validation';
import capture from '../../middlewares/capture';

const talent = Router();
{
  talent.get('/', purifyRequest(QueryValidations.list), TaskControllers.getAll);

  talent.post(
    '/:taskId/cancel',
    purifyRequest(QueryValidations.exists('taskId', 'task')),
    TaskControllers.cancelTask,
  );

  talent.post(
    '/:taskId/submit-post-link',
    purifyRequest(
      QueryValidations.exists('taskId', 'task'),
      TaskValidations.submitPostLink,
    ),
    TaskControllers.submitPostLink,
  );

  talent.post(
    '/:taskId/upload-matrix',
    capture({ screenshot: { maxCount: 1, size: 5 * 1024 * 1024 } }),
    purifyRequest(TaskValidations.uploadMatrix),
    TaskControllers.uploadMatrix,
  );
}

const subAdmin = Router();
{
  subAdmin.get(
    '/',
    purifyRequest(QueryValidations.list, TaskValidations.superGetAll),
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

export const TaskRoutes = { talent, subAdmin };
