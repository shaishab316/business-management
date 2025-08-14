import { Router } from 'express';
import { CompromiseControllers } from './Compromise.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';

const influencer = Router();
{
  influencer.get(
    '/',
    purifyRequest(QueryValidations.list),
    CompromiseControllers.getAll,
  );
}

const subAdmin = Router();
{
  subAdmin.get(
    '/',
    purifyRequest(QueryValidations.list),
    CompromiseControllers.superGetAll,
  );
}

export const CompromiseRoutes = { influencer, subAdmin };
