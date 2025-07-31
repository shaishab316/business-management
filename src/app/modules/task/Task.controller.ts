import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { TaskServices } from './Task.service';
import { ETaskStatus } from '../../../../prisma';
import prisma from '../../../util/prisma';
import ServerError from '../../../errors/ServerError';

export const TaskControllers = {
  create: catchAsync(async ({ body, params, user }, res) => {
    const data = await TaskServices.create({
      ...body,
      talentId: user.id,
      campaignId: params.campaignId,
    });

    serveResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: 'Task created successfully!',
      data,
    });
  }),

  getAll: catchAsync(async ({ query, user }, res) => {
    const data = await TaskServices.getAll({
      ...query,
      talentId: user.id,
    });

    serveResponse(res, {
      message: 'Tasks retrieved successfully!',
      data,
    });
  }),

  superGetAll: catchAsync(async ({ query }, res) => {
    const data = await TaskServices.getAll(query);

    serveResponse(res, {
      message: 'Tasks retrieved successfully!',
      data,
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
      include: { talent: true },
    });

    if (task?.talentId !== user.id)
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        `You cannot cancel ${task?.talent?.name}'s task.`,
      );

    const data = await TaskServices.updateStatus(task?.id, ETaskStatus.CANCEL);

    serveResponse(res, {
      message: `Task ${data.status.toLocaleLowerCase()} successfully!`,
      data,
    });
  }),
};
