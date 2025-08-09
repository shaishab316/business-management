import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { CompromiseServices } from './Compromise.service';

export const CompromiseControllers = {
  create: catchAsync(async ({ body }, res) => {
    const data = await CompromiseServices.create(body);

    serveResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: 'Compromise created successfully!',
      data,
    });
  }),
};
