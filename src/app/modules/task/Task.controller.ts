import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { TaskServices } from './Task.service';

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
};
