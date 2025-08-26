import { StatusCodes } from 'http-status-codes';
import {
  EPaymentStatus,
  ETaskStatus,
  Payment as TPayment,
} from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import prisma from '../../../util/prisma';
import { TPagination } from '../../../util/server/serveResponse';
import { TList } from '../query/Query.interface';

export const PaymentServices = {
  async create(paymentData: TPayment) {
    const existingPayment = await prisma.payment.findUnique({
      where: {
        taskId: paymentData.taskId,
      },
    });

    if (existingPayment)
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        `Already requested payment for this task.`,
      );

    const task = await prisma.task.findUnique({
      where: { id: paymentData.taskId },
      select: {
        campaign: {
          select: {
            budget: true,
          },
        },
        influencer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (task?.influencer.id !== paymentData.influencerId)
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        `You cannot request payment for ${task?.influencer?.name}'s task.`,
      );

    paymentData.amount = task!.campaign.budget;

    return prisma.payment.create({ data: paymentData });
  },

  async changeStatus(paymentId: string, status: EPaymentStatus) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        taskId: true,
      },
    });

    return prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: { status },
      }),
      prisma.task.update({
        where: { id: payment?.taskId },
        data: { paymentStatus: status },
      }),
    ]);
  },

  async getAll({ page, limit, ...where }: TList) {
    const payments = await prisma.payment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.payment.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
        query: where,
      },
      payments,
    };
  },

  async getPayments({
    page,
    limit,
    influencerId,
    isPaymentDone,
  }: TList & { influencerId: string; isPaymentDone?: boolean }) {
    const where = {
      influencerId,
      isPaymentDone,
      status: ETaskStatus.COMPLETED,
    };

    const tasks = await prisma.task.findMany({
      where,
      include: { campaign: true },
    });

    const total = await prisma.task.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
      },
      campaigns: tasks.map(({ campaign, duration, ...task }) => ({
        ...task,
        ...campaign,
        duration,
      })),
    };
  },

  async getEarnings(influencerId: string) {
    const [pendingEarnings, paidEarnings] = await Promise.all([
      prisma.task.aggregate({
        _sum: {
          budget: true,
        },
        where: {
          influencerId,
          status: 'COMPLETED',
          isPaymentDone: false,
        },
      }),

      prisma.task.aggregate({
        _sum: {
          budget: true,
        },
        where: {
          influencerId,
          status: 'COMPLETED',
          isPaymentDone: true,
        },
      }),
    ]);

    const pending = pendingEarnings?._sum?.budget ?? 0;
    const paid = paidEarnings?._sum?.budget ?? 0;

    return { pending, paid, total: pending + paid };
  },
};
