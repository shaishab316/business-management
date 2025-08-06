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
};
