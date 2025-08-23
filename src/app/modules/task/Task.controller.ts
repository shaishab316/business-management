import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { TaskServices } from './Task.service';
import { ETaskStatus } from '../../../../prisma';
import prisma from '../../../util/prisma';
import ServerError from '../../../errors/ServerError';

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
    const data = await TaskServices.acceptTask({
      ...body,
      id: params.taskId,
      influencerId: user.id,
    });

    serveResponse(res, {
      message: 'Task accepted successfully!',
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
    const { meta, tasks } = await TaskServices.getAll(query, true);

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
    const task = await prisma.task.findUnique({
      where: { id: params.taskId },
      include: { influencer: true },
    });

    if (task?.influencerId !== user.id)
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        `You cannot cancel ${task?.influencer?.name}'s task.`,
      );

    const data = await TaskServices.updateStatus(task?.id, ETaskStatus.CANCEL);

    serveResponse(res, {
      message: `Task ${data.status.toLocaleLowerCase()} successfully!`,
      data,
    });
  }),

  submitPostLink: catchAsync(async ({ params, body }, res) => {
    const data = await TaskServices.submitPostLink(
      params.taskId,
      body.postLink,
    );

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
