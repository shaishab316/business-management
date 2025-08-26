import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { TaskServices } from './Task.service';
import { ETaskStatus } from '../../../../prisma';
import prisma from '../../../util/prisma';
import ServerError from '../../../errors/ServerError';
import { CampaignServices } from '../campaign/Campaign.service';

export const TaskControllers = {
  createTask: catchAsync(async ({ body, params }, res) => {
    const data = await TaskServices.createTask({
      ...body,
      campaignId: params.campaignId,
    });

    serveResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: 'Task created successfully!',
      data,
    });
  }),

  acceptTask: catchAsync(async ({ body, params, user }, res) => {
    const campaignId = params.campaignId,
      influencerId = user.id;

    await TaskServices.acceptTask({
      ...body,
      id: (
        await TaskServices.getTask({
          influencerId,
          campaignId,
        })
      ).id,
      influencerId,
    });

    const data = await CampaignServices.getById({
      influencerId,
      campaignId,
    });

    serveResponse(res, {
      message: 'Campaign accepted successfully!',
      data,
    });
  }),

  getAll: catchAsync(async ({ query, user }, res) => {
    const { meta, tasks } = await TaskServices.getAll({
      ...query,
      influencerId: user.id,
    });

    serveResponse(res, {
      message: 'Tasks retrieved successfully!',
      meta,
      data: tasks,
    });
  }),

  superGetAll: catchAsync(async ({ query }, res) => {
    const { meta, tasks } = await TaskServices.getAll(query);

    serveResponse(res, {
      message: 'Tasks retrieved successfully!',
      meta,
      data: tasks,
    });
  }),

  updateStatus: catchAsync(async ({ params }, res) => {
    const data = await TaskServices.updateStatus(params.taskId, params.status);

    serveResponse(res, {
      message: `Task ${data.status.toLocaleLowerCase()} successfully!`,
      data,
    });
  }),

  cancelTask: catchAsync(async ({ params, user }, res) => {
    const campaignId = params.campaignId,
      influencerId = user.id;

    const task = await prisma.task.findFirst({
      where: {
        campaignId,
        influencerId,
      },
      include: { influencer: true },
    });

    if (task?.influencerId !== influencerId)
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        `You cannot cancel ${task?.influencer?.name}'s task.`,
      );

    if (task?.status === ETaskStatus.CANCEL)
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        `Campaign Task already ${task?.status?.toLocaleLowerCase()}.`,
      );

    await TaskServices.updateStatus(task?.id, ETaskStatus.CANCEL);

    const data = await CampaignServices.getById({
      influencerId,
      campaignId,
    });

    serveResponse(res, {
      message: `Campaign Task ${data.status.toLocaleLowerCase()} successfully!`,
      data,
    });
  }),

  submitPostLink: catchAsync(async ({ params, body, user }, res) => {
    const campaignId = params.campaignId,
      influencerId = user.id;

    await TaskServices.submitPostLink(
      (await TaskServices.getTask({ influencerId, campaignId })).id,
      body.postLink,
    );

    const data = await CampaignServices.getById({
      influencerId,
      campaignId,
    });

    serveResponse(res, {
      message: 'Post link submitted successfully!',
      data,
    });
  }),

  uploadMatrix: catchAsync(async ({ params, body }, res) => {
    const data = await TaskServices.uploadMatrix(params.taskId, body);

    serveResponse(res, {
      message: 'Matrix uploaded successfully!',
      data,
    });
  }),
};
