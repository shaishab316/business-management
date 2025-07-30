import { Router } from 'express';
import { CampaignControllers } from './Campaign.controller';
import { CampaignValidations } from './Campaign.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import capture from '../../middlewares/capture';
import { QueryValidations } from '../query/Query.validation';

const router = Router();

router.get(
  '/',
  purifyRequest(QueryValidations.list),
  CampaignControllers.getAll,
);

router.get(
  '/:campaignId',
  purifyRequest(QueryValidations.exists('campaignId', 'campaign')),
  CampaignControllers.getById,
);

router.post(
  '/create',
  capture({
    banner: {
      size: 5 * 1024 * 1024,
      maxCount: 1,
    },
  }),
  purifyRequest(CampaignValidations.create),
  CampaignControllers.create,
);

router.patch(
  '/:campaignId/edit',
  capture({
    banner: {
      size: 5 * 1024 * 1024,
      maxCount: 1,
    },
  }),
  purifyRequest(CampaignValidations.edit),
  CampaignControllers.edit,
);

router.delete(
  '/:campaignId/delete',
  purifyRequest(QueryValidations.exists('campaignId', 'campaign')),
  CampaignControllers.delete,
);

export const CampaignRoutes = router;
