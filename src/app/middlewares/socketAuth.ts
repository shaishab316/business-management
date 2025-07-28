/* eslint-disable no-unused-vars */
import { Socket } from 'socket.io';
import { decodeToken } from '../modules/auth/Auth.utils';
import { json } from '../../util/transform/json';
import prisma from '../../util/prisma';

const socketAuth = async (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.query?.token as string;

  if (!token) return next(new Error('Token not provided'));

  try {
    const { userId } = decodeToken(token, 'access_token');
    const user = await prisma.user.findFirst({ where: { id: userId } });

    if (!user) return next(new Error('User not found'));

    socket.data.user = json(JSON.stringify(user));

    socket.join(userId);
    next();
  } catch (error: any) {
    next(error);
  }
};

export default socketAuth;
