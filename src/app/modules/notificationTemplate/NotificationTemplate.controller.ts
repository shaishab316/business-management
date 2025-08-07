import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { NotificationTemplateServices } from './NotificationTemplate.service';

export const NotificationTemplateControllers = {
  create: catchAsync(async (req, res) => {
    const data = await NotificationTemplateServices.create(req.body);

    serveResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: 'NotificationTemplate created successfully!',
      data,
    });
  }),

  update: catchAsync(async ({ params, body }, res) => {
    const data = await NotificationTemplateServices.update(params.id, body);

    serveResponse(res, {
      message: 'NotificationTemplate updated successfully!',
      data,
    });
  }),

  delete: catchAsync(async ({ params }, res) => {
    await NotificationTemplateServices.delete(params.id);

    serveResponse(res, {
      message: 'NotificationTemplate deleted successfully!',
    });
  }),

  getAll: catchAsync(async ({ query }, res) => {
    const { meta, notificationTemplates } =
      await NotificationTemplateServices.getAll(query);

    serveResponse(res, {
      message: 'NotificationTemplates retrieved successfully!',
      meta,
      data: notificationTemplates,
    });
  }),

  getById: catchAsync(async ({ params }, res) => {
    const data = await NotificationTemplateServices.getById(params.id);

    serveResponse(res, {
      message: 'NotificationTemplate retrieved successfully!',
      data,
    });
  }),
};
