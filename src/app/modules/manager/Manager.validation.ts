import z from 'zod';
import { exists } from '../../../util/db/exists';

export const ManagerValidations = {
  submitPostLink: z.object({
    body: z.object({
      campaignId: z.string().refine(exists('campaign'), campaignId => ({
        message: `Campaign with id ${campaignId} does not exist.`,
        path: ['campaignId'],
      })),
      influencerId: z.string().refine(exists('user'), influencerId => ({
        message: `Influencer with id ${influencerId} does not exist.`,
        path: ['influencerId'],
      })),
      postLink: z
        .string({
          message: 'Post link is required',
        })
        .trim(),
    }),
  }),
};
