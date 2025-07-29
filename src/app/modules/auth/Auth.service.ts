/* eslint-disable no-unused-vars */
import { encodeToken, TToken, verifyPassword } from './Auth.utils';
import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import config from '../../../config';
import { Response } from 'express';
import ms from 'ms';
import prisma from '../../../util/prisma';

export const AuthServices = {
  async getAuth(userId: string, password: string) {
    const auth = await prisma.auth.findFirst({
      where: { user: { id: userId } },
    });

    if (!auth || !(await verifyPassword(password, auth.password)))
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

  /** this function returns an object of tokens
   * e.g. retrieveToken(userId, 'access_token', 'refresh_token');
   * returns { access_token, refresh_token }
   */
  retrieveToken<T extends readonly TToken[]>(
    userId: string,
    ...token_types: T
  ) {
    return Object.fromEntries(
      token_types.map(token_type => [
        token_type,
        encodeToken({ userId }, token_type),
      ]),
    ) as Record<T[number], string>;
  },

  async changePassword(authId: string, password: string) {
    return prisma.auth.update({
      where: { id: authId },
      data: { password: await password?.hash() },
    });
  },
};
