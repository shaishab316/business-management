import { Router } from 'express';
import { TaskControllers } from './Task.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { TaskValidations } from './Task.validation';
import capture from '../../middlewares/capture';

const influencer = Router();
{
  influencer.get(
    '/',
    purifyRequest(QueryValidations.list),
    TaskControllers.getAll,
  );

  influencer.post(
    '/:taskId/accept',
    purifyRequest(QueryValidations.exists('taskId', 'task')),
    capture({
      influencerAgreementProof: { maxCount: 1, size: 5 * 1024 * 1024 },
    }),
    purifyRequest(TaskValidations.acceptTask),
    TaskControllers.acceptTask,
  );

  influencer.post(
    '/:taskId/cancel',
    purifyRequest(QueryValidations.exists('taskId', 'task')),
    TaskControllers.cancelTask,
  );

  influencer.post(
    '/:taskId/submit-post-link',
    purifyRequest(
      QueryValidations.exists('taskId', 'task'),
      TaskValidations.submitPostLink,
    ),
    TaskControllers.submitPostLink,
  );

  influencer.post(
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

export const TaskRoutes = { influencer, subAdmin };
