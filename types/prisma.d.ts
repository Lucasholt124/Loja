// types/prisma.d.ts

import { PrismaClient } from '@prisma/client';

declare global {
  // Desabilitamos as regras 'no-var' e 'no-unused-vars' para esta declaração global.
  // eslint-disable-next-line no-unused-vars, no-var
  var prisma: PrismaClient | undefined;
}