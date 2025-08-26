import { Router } from 'express';
import { CampaignControllers } from './Campaign.controller';
import { CampaignValidations } from './Campaign.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import capture from '../../middlewares/capture';
import { QueryValidations } from '../query/Query.validation';
import { TaskControllers } from '../task/Task.controller';
import { ReviewValidations } from '../review/Review.validation';
import { ReviewControllers } from '../review/Review.controller';
import { TaskValidations } from '../task/Task.validation';

const bannerCapture = capture({
  banner: {
    size: 5 * 1024 * 1024,
    maxCount: 1,
  },
});

const influencer = Router();
{
  influencer.get(
    '/',
    purifyRequest(QueryValidations.list, TaskValidations.getAll),
    CampaignControllers.getAll,
  );

  influencer.get(
    '/:campaignId',
    purifyRequest(QueryValidations.exists('campaignId', 'campaign')),
    CampaignControllers.getById,
  );

  influencer.post(
    '/:campaignId/review',
    purifyRequest(
      QueryValidations.exists('campaignId', 'campaign'),
      ReviewValidations.giveReview,
    ),
    ReviewControllers.giveReview,
  );
}

const subAdmin = Router();
{
  subAdmin.get(
    '/',
    purifyRequest(QueryValidations.list),
    CampaignControllers.superGetAll,
  );

  subAdmin.get(
    '/:campaignId',
    purifyRequest(QueryValidations.exists('campaignId', 'campaign')),
    CampaignControllers.getById,
  );

  subAdmin.post(
    '/create',
    bannerCapture,
    purifyRequest(CampaignValidations.create),
    CampaignControllers.create,
  );

  subAdmin.post(
    '/:campaignId/create-task',
    purifyRequest(
      QueryValidations.exists('campaignId', 'campaign'),
      TaskValidations.create,
    ),
    TaskControllers.createTask,
  );

  subAdmin.patch(
    '/:campaignId/edit',
    bannerCapture,
    purifyRequest(CampaignValidations.edit),
    CampaignControllers.edit,
  );

  subAdmin.delete(
    '/:campaignId/delete',
    purifyRequest(QueryValidations.exists('campaignId', 'campaign')),
    CampaignControllers.delete,
  );
}

const admin = Router();
{
  admin.get(
    '/analytics',
    purifyRequest(QueryValidations.list, CampaignValidations.analytics),
    CampaignControllers.analytics,
  );
}

export const CampaignRoutes = { subAdmin, influencer, admin };
