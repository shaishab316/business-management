import { Router } from 'express';
import { ManagerInfluencerRoutes } from '../managerInfluencer/ManagerInfluencer.route';
import { ManagerControllers } from './Manager.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { ManagerValidations } from './Manager.validation';
import capture from '../../middlewares/capture';

const manager = Router().inject([
  {
    path: '/influencers',
    route: ManagerInfluencerRoutes.manager,
  },
]);
{
  manager.get(
    '/pending-tasks',
    purifyRequest(QueryValidations.list),
    ManagerControllers.pendingTask,
  );

  manager.get(
    '/campaigns',
    purifyRequest(QueryValidations.list, ManagerValidations.getCampaigns),
    ManagerControllers.getCampaigns,
  );

  manager.get(
    '/campaigns/:campaignId',
    purifyRequest(QueryValidations.exists('campaignId', 'campaign')),
    ManagerControllers.getCampaignDetails,
  );

  manager.post(
    '/submit-post-link',
    purifyRequest(ManagerValidations.submitPostLink),
    ManagerControllers.submitPostLink,
  );

  manager.post(
    '/upload-matrix',
    capture({
      screenshot: { maxCount: 1, size: 5 * 1024 * 1024, fileType: 'images' },
    }),
    purifyRequest(ManagerValidations.uploadMatrix),
    ManagerControllers.uploadMatrix,
  );
}

export default manager;
