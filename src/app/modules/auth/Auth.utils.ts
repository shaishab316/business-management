import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../../config';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { errorLogger } from '../../../util/logger/logger';
import colors from 'colors';
import bcrypt from 'bcryptjs';
import { EUserRole } from '../../../../prisma';

export type TToken = keyof typeof config.jwt;
export const superRoles: EUserRole[] = [EUserRole.ADMIN];

/**
 * Create a token
 * @param payload - The payload to sign
 * @param token_type - The type of token to create
 * @returns The signed token
 */
export const encodeToken = (payload: JwtPayload, token_type: TToken) => {
  try {
    return jwt.sign({ ...payload, token_type }, config.jwt[token_type].secret, {
      expiresIn: config.jwt[token_type].expire_in,
    });
  } catch (error: any) {
    errorLogger.error(colors.red('🔑 Failed to create token'), error);
    throw new ServerError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to create token ::=> ' + error.message,
    );
  }
};

/**
 * Verify a token with improved error handling
 * @param token - The token to verify
 * @param token_type - The type of token to verify
 * @returns The decoded token
 */
export const decodeToken = (token = '', token_type: TToken) => {
  token = token.trim();
  if (!token || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token))
    throw new ServerError(
      StatusCodes.UNAUTHORIZED,
      `Please provide a valid ${token_type.replace('_', ' ')}.`,
    );

  try {
    return jwt.verify(token, config.jwt[token_type].secret) as JwtPayload;
  } catch (error) {
    errorLogger.error(colors.red('🔑 Failed to verify token'), error);

    if (token_type === 'reset_token')
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'Your password reset link has expired.',
      );
    else
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'Your session has expired.',
      );
  }
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(config.bcrypt_salt_rounds);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
