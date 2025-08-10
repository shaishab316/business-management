import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { NotificationServices } from './Notification.service';

export const NotificationControllers = {
  send: catchAsync(async ({ body }, res) => {
    const data = await NotificationServices.send(body);

    serveResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: 'Notification send successfully!',
      data,
    });
  }),

  getAll: catchAsync(async ({ query, user }, res) => {
    const { meta, notifications } = await NotificationServices.getAll({
      ...query,
      influencerId: user.id,
    });

    serveResponse(res, {
      message: 'Notifications retrieved successfully!',
      meta,
      data: notifications,
    });
  }),

  superGetAll: catchAsync(async ({ query }, res) => {
    const { meta, notifications } = await NotificationServices.getAll(query);

    serveResponse(res, {
      message: 'Notifications retrieved successfully!',
      meta,
      data: notifications,
    });
  }),

  readNotification: catchAsync(async ({ params }, res) => {
    const data = await NotificationServices.readNotification(
      params.notificationId,
    );

    serveResponse(res, {
      message: 'Notification read successfully!',
      data,
    });
  }),

  readAllNotifications: catchAsync(async ({ user }, res) => {
    const data = await NotificationServices.readAllNotifications(user.id);

    serveResponse(res, {
      message: 'All notifications read successfully!',
      data,
    });
  }),
};
