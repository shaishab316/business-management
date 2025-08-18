import { StatusCodes } from 'http-status-codes';
import ServerError from '../../errors/ServerError';
import { decodeToken, superRoles, TToken } from '../modules/auth/Auth.utils';
import catchAsync from './catchAsync';
import { EUserRole } from '../../../prisma';
import prisma from '../../util/prisma';

/**
 * Middleware to authenticate and authorize requests based on user roles
 *
 * @param roles - The roles that are allowed to access the resource
 */
const auth = (roles: EUserRole[] = [], token_type: TToken = 'access_token') =>
  catchAsync(async (req, _, next) => {
    const token =
      req.cookies[token_type] ||
      req.headers.authorization?.split(/Bearer /i)?.[1] ||
      req.query[token_type];

    req.user = (await prisma.user.findUnique({
      where: { id: decodeToken(token, token_type).userId },
    }))!;

    if (
      !req.user ||
      (roles[0] &&
        !superRoles.includes(req.user.role) &&
        !roles.includes(req.user.role))
    )
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        req.user.role === EUserRole.GUEST
          ? 'Your account is not verified yet. Please verify your account.'
          : `Permission denied. You are not a ${roles
              .concat(EUserRole.ADMIN)
              .map(role => role.toLocaleLowerCase().replace(/_/g, ' '))
              .join(
                ' or ',
              )}! You are a ${req.user.role.toLocaleLowerCase().replace(/_/g, ' ')}!`,
      );

    next();
  });

auth.admin = () => auth([EUserRole.ADMIN]);
auth.subAdmin = () => auth([EUserRole.SUB_ADMIN]);
auth.influencer = () => auth([EUserRole.INFLUENCER]);
auth.user = () => auth([EUserRole.USER]);
auth.notGuest = () => auth(Object.values(EUserRole).excludes(EUserRole.GUEST));
auth.guest = () => auth([EUserRole.GUEST]);

auth.reset = () => auth([], 'reset_token');
auth.refresh = () => auth([], 'refresh_token');

export default auth;
