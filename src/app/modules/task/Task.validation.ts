import { z } from 'zod';
import { exists } from '../../../util/db/exists';
import { ETaskStatus } from '../../../../prisma';
import { upper } from '../../../util/transform/upper';
import prisma from '../../../util/prisma';
import { Request } from 'express';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { enum_encode } from '../../../util/transform/enum';

export const TaskValidations = {
  acceptTask: z.object({
    body: z.object({
      influencerAgreementProof: z.string({
        required_error: 'Influencer agreement proof is missing',
      }),
    }),
  }),

  create: z.object({
    body: z.object({
      influencerId: z.string().refine(exists('user'), influencerId => ({
        message: 'Influencer not found with id: ' + influencerId,
        path: ['influencerId'],
      })),
    }),
  }),

  getAll: z.object({
    query: z.object({
      status: z
        .string()
        .transform(enum_encode)
        .optional()
        .pipe(z.nativeEnum(ETaskStatus).optional()),
    }),
  }),

  superGetAll: z.object({
    query: z.object({
      influencerId: z
        .string()
        .optional()
        .refine(exists('user'), influencerId => ({
          message: 'Influencer not found with id: ' + influencerId,
          path: ['influencerId'],
        })),
    }),
  }),

  updateStatus: z.object({
    params: z.object({
      status: z.string().transform(upper).pipe(z.nativeEnum(ETaskStatus)),
    }),
  }),

  submitPostLink: z.object({
    body: z.object({
      postLink: z
        .string({
          required_error: 'Post link is missing',
        })
        .url('Give a valid post link'),
    }),
  }),

  uploadMatrix: async ({ params }: Request) => {
    const task = await prisma.task.findUnique({
      where: { id: params.taskId },
      select: {
        campaign: {
          select: {
            expected_metrics: true,
          },
        },
      },
    });

    if (!task) throw new ServerError(StatusCodes.NOT_FOUND, 'Task not found');

    return z.object({
      body: z.object({
        screenshot: z.string({
          required_error: 'Screenshot is missing',
        }),

        ...Object.fromEntries(
          Object.entries(task.campaign.expected_metrics ?? {}).map(([key]) => [
            key,
            z
              .string({
                required_error: `${key} is missing`,
              })
              .min(1, `${key} can't be empty`),
          ]),
        ),
      }),
    });
  },
};
