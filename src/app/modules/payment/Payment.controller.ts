import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { PaymentServices } from './Payment.service';
import { EPaymentMethod, Payment as TPayment } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';

export const PaymentControllers = {
  create: catchAsync(async ({ params, user, query, body }, res) => {
    const paymentData: Partial<TPayment> = {
      influencerId: user.id,
      taskId: params.taskId,
      method: query.method,
    };

    if (query.method === EPaymentMethod.INVOICE) {
      if (!body.invoices?.length) {
        throw new ServerError(StatusCodes.BAD_REQUEST, 'Invoices is required!');
      }

      paymentData.invoices = body.invoices;
    }

    const data = await PaymentServices.create(paymentData as TPayment);

    serveResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: 'Payment created successfully!',
      data,
    });
  }),

  changeStatus: catchAsync(async ({ params }, res) => {
    const data = await PaymentServices.changeStatus(
      params.paymentId,
      params.status,
    );

    serveResponse(res, {
      message: `Payment ${data.status.toLocaleLowerCase()} successfully!`,
      data,
    });
  }),
};
