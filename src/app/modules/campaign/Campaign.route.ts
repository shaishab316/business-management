import { Router } from 'express';
import { CampaignControllers } from './Campaign.controller';
import { CampaignValidations } from './Campaign.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import capture from '../../middlewares/capture';
import { QueryValidations } from '../query/Query.validation';
import { TaskValidations } from '../task/Task.validation';
import { TaskControllers } from '../task/Task.controller';
import auth from '../../middlewares/auth';
import { ReviewValidations } from '../review/Review.validation';
import { ReviewControllers } from '../review/Review.controller';

const bannerCapture = capture({
  banner: {
    size: 5 * 1024 * 1024,
    maxCount: 1,
  },
});

const talent = Router();
{
  talent.get(
    '/',
    purifyRequest(QueryValidations.list),
    CampaignControllers.getAll,
  );

  talent.get(
    '/:campaignId',
    purifyRequest(QueryValidations.exists('campaignId', 'campaign')),
    CampaignControllers.getById,
  );

  talent.post(
    '/:campaignId/create-task',
    purifyRequest(QueryValidations.exists('campaignId', 'campaign')),
    auth.talent(),
    capture({
      talentAgreementProof: {
        size: 5 * 1024 * 1024,
        maxCount: 1,
      },
    }),
    purifyRequest(TaskValidations.create),
    TaskControllers.create,
  );

  talent.post(
    '/:campaignId/review',
    auth.talent(),
    purifyRequest(
      QueryValidations.exists('campaignId', 'campaign'),
      ReviewValidations.giveReview,
    ),
    ReviewControllers.giveReview,
  );
}

const subAdmin = Router();
{
  subAdmin.post(
    '/create',
    bannerCapture,
    purifyRequest(CampaignValidations.create),
    CampaignControllers.create,
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

export const CampaignRoutes = { subAdmin, talent };
