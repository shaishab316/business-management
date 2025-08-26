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
import { PaymentValidations } from '../payment/Payment.validation';
import { PaymentControllers } from '../payment/Payment.controller';

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

  /** Task routes */
  influencer.post(
    '/:campaignId/accept',
    purifyRequest(QueryValidations.exists('campaignId', 'campaign')),
    capture({
      influencerAgreementProof: { maxCount: 1, size: 5 * 1024 * 1024 },
    }),
    purifyRequest(TaskValidations.acceptTask),
    TaskControllers.acceptTask,
  );

  influencer.post(
    '/:campaignId/cancel',
    purifyRequest(QueryValidations.exists('campaignId', 'campaign')),
    TaskControllers.cancelTask,
  );

  influencer.post(
    '/:campaignId/submit-post-link',
    purifyRequest(
      QueryValidations.exists('campaignId', 'campaign'),
      TaskValidations.submitPostLink,
    ),
    TaskControllers.submitPostLink,
  );

  influencer.post(
    '/:campaignId/upload-matrix',
    purifyRequest(QueryValidations.exists('campaignId', 'campaign')),
    capture({ screenshot: { maxCount: 1, size: 5 * 1024 * 1024 } }),
    purifyRequest(TaskValidations.uploadMatrix),
    TaskControllers.uploadMatrix,
  );

  influencer.post(
    '/:campaignId/request-for-payment',
    purifyRequest(PaymentValidations.create),
    capture({
      invoices: { maxCount: 10, size: 5 * 1024 * 1024 },
    }),
    PaymentControllers.create,
  );
}

const subAdmin = Router();
{
  subAdmin.get(
    '/active',
    purifyRequest(QueryValidations.list),
    CampaignControllers.activeCampaigns,
  );

  subAdmin.get(
    '/completed',
    purifyRequest(QueryValidations.list),
    CampaignControllers.completedCampaigns,
  );

  subAdmin.get(
    '/:campaignId',
    purifyRequest(QueryValidations.exists('campaignId', 'campaign')),
    CampaignControllers.superGetCampaignById,
  );

  subAdmin.get(
    '/:campaignId/influencers',
    purifyRequest(QueryValidations.exists('campaignId', 'campaign')),
    CampaignControllers.getCampaignInfluencers,
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
