import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { PaymentServices } from './Payment.service';
import { EPaymentMethod, Payment as TPayment } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import { TaskServices } from '../task/Task.service';

export const PaymentControllers = {
  create: catchAsync(async ({ params, user, query, body }, res) => {
    const influencerId = user.id;

    const paymentData: Partial<TPayment> = {
      influencerId,
      taskId: (
        await TaskServices.getTask({
          campaignId: params.campaignId,
          influencerId,
        })
      ).id,
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
    const [data] = await PaymentServices.changeStatus(
      params.paymentId,
      params.status,
    );

    serveResponse(res, {
      message: `Payment ${data.status.toLocaleLowerCase()} successfully!`,
      data,
    });
  }),

  getAll: catchAsync(async ({ query, user }, res) => {
    const { meta, payments } = await PaymentServices.getAll({
      ...query,
      influencerId: user.id,
    });

    serveResponse(res, {
      message: 'Payments retrieved successfully!',
      meta,
      data: payments,
    });
  }),

  superGetAll: catchAsync(async ({ query }, res) => {
    const { meta, payments } = await PaymentServices.getAll(query);

    serveResponse(res, {
      message: 'Payments retrieved successfully!',
      meta,
      data: payments,
    });
  }),

  pendingPayment: catchAsync(async ({ query, user }, res) => {
    const { campaigns, meta } = await PaymentServices.getPayments({
      ...query,
      influencerId: user.id,
      isPaymentDone: false,
    });

    serveResponse(res, {
      message: 'Pending Payment successfully!',
      meta,
      data: campaigns,
    });
  }),

  paidPayment: catchAsync(async ({ query, user }, res) => {
    const { campaigns, meta } = await PaymentServices.getPayments({
      ...query,
      influencerId: user.id,
      isPaymentDone: true,
    });

    serveResponse(res, {
      message: 'Paid Payment successfully!',
      meta,
      data: campaigns,
    });
  }),

  getEarnings: catchAsync(async ({ user }, res) => {
    const data = await PaymentServices.getEarnings(user.id);

    serveResponse(res, {
      message: 'Earnings retrieved successfully!',
      data,
    });
  }),
};
