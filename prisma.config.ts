import path from 'path';
import type { PrismaConfig } from 'prisma';
import './src/config/configure';

export default {
  earlyAccess: true,
  schema: path.resolve('src/app/modules'),
} satisfies PrismaConfig;
