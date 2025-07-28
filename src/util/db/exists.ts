import ServerError from '../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import prisma, { TModels } from '../prisma';

export const exists =
  (model: TModels) =>
  async (id: string | null = null) =>
    !id ||
    (await (prisma[model] as any).findUnique({ where: { id } })) ||
    Promise.reject(
      new ServerError(
        StatusCodes.NOT_FOUND,
        `${model.toCapitalize()} not found`,
      ),
    );
