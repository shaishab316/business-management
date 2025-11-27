import z from 'zod';
import { exists } from '../../../util/db/exists';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import prisma from '../../../util/prisma';
import { EPaymentMethod } from '../../../../prisma';

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

  getCampaigns: z.object({
    query: z.object({
      tab: z.enum(['active', 'completed']).default('active'),
    }),
  }),

  uploadMatrix: async ({ body }: any) => {
    if (!body?.campaignId) {
      throw new ServerError(StatusCodes.BAD_REQUEST, 'campaignId is required');
    }

    const campaign = await prisma.campaign.findUnique({
      where: {
        id: body?.campaignId,
      },
      select: {
        expected_metrics: true,
      },
    });

    if (!campaign)
      throw new ServerError(StatusCodes.NOT_FOUND, 'Campaign not found');

    return z.object({
      body: z.object({
        campaignId: z.string(),
        influencerId: z.string().refine(exists('user'), influencerId => ({
          message: `Influencer with id ${influencerId} does not exist.`,
          path: ['influencerId'],
        })),

        screenshot: z.string({
          required_error: 'Screenshot is missing',
        }),

        ...Object.fromEntries(
          Object.entries(campaign.expected_metrics ?? {}).map(([key]) => [
            key,
            z.coerce
              .number({
                required_error: `${key} is missing`,
              })
              .min(1, `${key} can't be empty`),
          ]),
        ),
      }),
    });
  },

  sendPaymentRequest: z.object({
    body: z.object({
      campaignId: z.string().refine(exists('campaign'), campaignId => ({
        message: `Campaign with id ${campaignId} does not exist.`,
        path: ['campaignId'],
      })),
      influencerId: z.string().refine(exists('user'), influencerId => ({
        message: `Influencer with id ${influencerId} does not exist.`,
        path: ['influencerId'],
      })),
      method: z.nativeEnum(EPaymentMethod),
      invoices: z.array(z.string()).optional().nullable(),
    }),
  }),

  getPayments: z.object({
    query: z.object({
      tab: z.enum(['pending', 'paid']).default('pending'),
    }),
  }),
};
