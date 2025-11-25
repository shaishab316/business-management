import { z } from 'zod';
import { exists } from '../../../util/db/exists';

export const ManagerInfluencerValidations = {
  inviteManager: z.object({
    body: z.object({
      managerId: z.string().refine(exists('user'), managerId => ({
        message: 'Manager not found with id: ' + managerId,
        path: ['managerId'],
      })),
    }),
  }),

  inviteInfluencer: z.object({
    body: z.object({
      influencerId: z.string().refine(exists('user'), influencerId => ({
        message: 'Influencer not found with id: ' + influencerId,
        path: ['influencerId'],
      })),
    }),
  }),

  disconnectInfluencer: z.object({
    body: z.object({
      influencerId: z.string().refine(exists('user'), influencerId => ({
        message: 'Influencer not found with id: ' + influencerId,
        path: ['influencerId],'],
      })),
    }),
  }),

  disconnectManager: z.object({
    body: z.object({
      managerId: z.string().refine(exists('user'), managerId => ({
        message: 'Manager not found with id: ' + managerId,
        path: ['managerId'],
      })),
    }),
  }),
};
