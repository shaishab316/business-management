import { StatusCodes } from 'http-status-codes';
import { ETaskStatus, Prisma, Task as TTask } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import prisma from '../../../util/prisma';
import { TPagination } from '../../../util/server/serveResponse';
import { TList } from '../query/Query.interface';
import { deleteImage } from '../../middlewares/capture';

export const TaskServices = {
  async createTask(taskData: TTask) {
    const existsTask = await prisma.task.findFirst({
      where: {
        campaignId: taskData.campaignId,
        influencerId: taskData.influencerId,
        status: ETaskStatus.PENDING,
      },
      include: {
        influencer: true,
        campaign: true,
      },
    });

    if (existsTask)
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        `${existsTask.influencer?.name} is already assigned to this campaign`,
      );

    const campaign = (await prisma.campaign.findUnique({
      where: { id: taskData.campaignId },
      select: { duration: true },
    }))!;

    taskData.duration = campaign.duration;

    return prisma.task.create({
      data: taskData as any,
      include: {
        campaign: true,
        influencer: true,
      },
    });
  },

  async acceptTask({ id, influencerId, ...taskData }: TTask) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        influencer: true,
        campaign: true,
      },
    });

    if (task?.influencerId !== influencerId)
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        `You cannot accept ${task?.influencer?.name}'s task.`,
      );

    if (task?.status !== ETaskStatus.PENDING)
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        `Task already ${task?.status?.toLocaleLowerCase()}.`,
      );

    return prisma.task.update({
      where: { id },
      data: {
        ...taskData,
        status: ETaskStatus.ACTIVE,
      },
    });
  },

  async getAll({
    page,
    limit,
    influencerId,
    status,
  }: TList & { status?: ETaskStatus }) {
    const where: Prisma.TaskWhereInput = {};

    if (influencerId) where.influencerId = influencerId;
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        campaign: true,
        influencer: true,
      },
      skip: (page - 1) * limit,
      take: limit,
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
        query: where,
      },
      tasks,
    };
  },

  async updateStatus(taskId: string, status: ETaskStatus) {
    return prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
  },

  async submitPostLink(taskId: string, postLink: string) {
    return prisma.task.update({
      where: { id: taskId },
      data: { postLink },
    });
  },

  async uploadMatrix(
    taskId: string,
    { screenshot, ...matrix }: Record<string, string>,
  ) {
    const task: any = await prisma.task.findUnique({
      where: { id: taskId },
      select: { matrix: true },
    });

    task?.matrix?.screenshot?.__pipes(deleteImage);

    return prisma.task.update({
      where: { id: taskId },
      data: { matrix, screenshot },
    });
  },
};
