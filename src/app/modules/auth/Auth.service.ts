/* eslint-disable no-unused-vars */
import User from '../user/User.model';
import { createToken, verifyPassword } from './Auth.utils';
import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import config from '../../../config';
import { Response } from 'express';
import ms from 'ms';
import { TToken } from './Auth.interface';
import prisma from '../../../util/prisma';

export const AuthServices = {
  async getAuth(userId: string, password: string) {
    const auth = await prisma.auth.findFirst({
      where: { user: { id: userId } },
    });

    if (!(await verifyPassword(password, auth?.password ?? '')))
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'Your credentials are incorrect.',
      );

    return auth;
  },

  setTokens(res: Response, tokens: { [key in TToken]?: string }) {
    Object.entries(tokens).forEach(([key, value]) =>
      res.cookie(key, value, {
        httpOnly: true,
        secure: !config.server.isDevelopment,
        maxAge: ms(config.jwt[key as TToken].expire_in),
      }),
    );
  },

  destroyTokens(res: Response, cookies: TToken[]) {
    for (const cookie of cookies)
      res.clearCookie(cookie as TToken, {
        httpOnly: true,
        secure: !config.server.isDevelopment,
        maxAge: 0, // expire immediately
      });
  },

  async resetPassword(userId: string, password: string) {
    return prisma.auth.update({
      where: { userId },
      data: { password: await password?.hash() },
    });
  },

  async retrieveToken(userId: string) {
    return {
      access_token: createToken({ userId }, 'access_token'),
      refresh_token: createToken({ userId }, 'refresh_token'),
      user: await User.findById(userId).lean(),
    };
  },
};
