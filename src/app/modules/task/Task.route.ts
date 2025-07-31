import { Router } from 'express';
import { TaskControllers } from './Task.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { TaskValidations } from './Task.validation';

const talent = Router();
{
  talent.get('/', purifyRequest(QueryValidations.list), TaskControllers.getAll);
}

const subAdmin = Router();
{
  subAdmin.get(
    '/',
    purifyRequest(QueryValidations.list, TaskValidations.superGetAll),
    TaskControllers.superGetAll,
  );
}

export const TaskRoutes = { talent, subAdmin };
