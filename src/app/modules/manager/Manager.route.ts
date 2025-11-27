import { Router } from 'express';
import { ManagerInfluencerRoutes } from '../managerInfluencer/ManagerInfluencer.route';
import { ManagerControllers } from './Manager.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { ManagerValidations } from './Manager.validation';
import capture from '../../middlewares/capture';

const manager = Router().inject([
  {
    /**
     * Mange influencers
     *
     * - get available influencers to invite
     * - invite influencers
     * - view influencer list
     * - remove influencers
     */
    path: '/influencers',
    route: ManagerInfluencerRoutes.manager,
  },
]);
{
  /**
   * Get all pending tasks that assigned to a manager influencers.
   *
   * Suppose: Manager Alice has Bob and Charlie as influencers.
   * So, Alice can see all pending tasks of Bob and Charlie here.
   */
  manager.get(
    '/pending-tasks',
    purifyRequest(QueryValidations.list),
    ManagerControllers.pendingTask,
  );

  /**
   * Getting list of campaigns assigned to the manager with tab [active, completed]
   *
   * active - ongoing campaigns
   * completed - finished campaigns
   */
  manager.get(
    '/campaigns',
    purifyRequest(QueryValidations.list, ManagerValidations.getCampaigns),
    ManagerControllers.getCampaigns,
  );

  /**
   * Getting details of a particular campaign
   *
   * full details including influencers involved, performance matrix, payments, etc.
   */
  manager.get(
    '/campaigns/:campaignId',
    purifyRequest(QueryValidations.exists('campaignId', 'campaign')),
    ManagerControllers.getCampaignDetails,
  );

  /**
   * Submitting post link for a particular influencer campaign
   *
   * eg. https://www.instagram.com/p/XXXXXXXXXXX/
   */
  manager.post(
    '/submit-post-link',
    purifyRequest(ManagerValidations.submitPostLink),
    ManagerControllers.submitPostLink,
  );

  /**
   * Uploading performance matrix with screenshot proof
   *
   * eg. views 1000, likes 100, comments 10 etc.
   */
  manager.post(
    '/upload-matrix',
    capture({
      screenshot: { maxCount: 1, size: 5 * 1024 * 1024, fileType: 'images' },
    }),
    purifyRequest(ManagerValidations.uploadMatrix),
    ManagerControllers.uploadMatrix,
  );

  /**
   * Sending payment request from manager to admin, for influencer payments
   *
   * 10% fee will be added automatically based on the payment method
   * 90% of the total amount will be sent to the influencer
   */
  manager.post(
    '/send-payment-request',
    capture({
      invoices: { maxCount: Infinity, size: Infinity, fileType: 'any' },
    }),
    purifyRequest(ManagerValidations.sendPaymentRequest),
    ManagerControllers.sendPaymentRequest,
  );
}

export default manager;
