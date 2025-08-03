import { StatusCodes } from 'http-status-codes';
import { ETaskStatus, Task as TTask } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import prisma from '../../../util/prisma';
import { TPagination } from '../../../util/server/serveResponse';
import { TList } from '../query/Query.interface';
import { deleteImage } from '../../middlewares/capture';

export const TaskServices = {
  async create(taskData: TTask) {
    const existsTask = await prisma.task.findFirst({
      where: {
        campaignId: taskData.campaignId,
        talentId: taskData.talentId,
        status: ETaskStatus.PENDING,
      },
      include: {
        talent: {
          select: {
            name: true,
          },
        },
      },
    });

    if (existsTask)
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        `${existsTask.talent?.name} is already assigned to this campaign`,
      );

    const campaign = (await prisma.campaign.findUnique({
      where: { id: taskData.campaignId },
      select: { duration: true },
    }))!;

    taskData.duration = campaign.duration;

    return prisma.task.create({
      data: taskData as any,
      include: {
        campaign: {
          select: {
            title: true,
            duration: true,
            banner: true,
          },
        },
        talent: {
          select: {
            name: true,
            avatar: true,
            socials: true,
          },
        },
      },
    });
  },

  async getAll({ page, limit, talentId }: TList) {
    const filter: any = {};

    if (talentId) filter.talentId = talentId;

    const tasks = await prisma.task.findMany({
      where: filter,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.task.count({ where: filter });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
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

  async uploadMatrix(taskId: string, matrix: Record<string, string>) {
    const task: any = await prisma.task.findUnique({
      where: { id: taskId },
      select: { matrix: true },
    });

    task?.matrix?.screenshot?._pipe(deleteImage);

    return prisma.task.update({
      where: { id: taskId },
      data: { matrix },
    });
  },
};
