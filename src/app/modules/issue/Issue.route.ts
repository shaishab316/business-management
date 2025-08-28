import { Router } from 'express';
import { IssueControllers } from './Issue.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';

const subAdmin = Router();
{
  subAdmin.get(
    '/:issueId/mark-as-read',
    purifyRequest(QueryValidations.exists('issueId', 'issue')),
    IssueControllers.markAsRead,
  );
}

export const IssueRoutes = { subAdmin };
