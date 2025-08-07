// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// A instância do Prisma Client é criada aqui.
// A lógica `global.prisma ?? ...` garante que em ambiente de desenvolvimento
// não sejam criadas múltiplas conexões com o banco a cada alteração de código.
const prisma = global.prisma ?? new PrismaClient({ log: ['query'] });

// Em ambiente de desenvolvimento, salvamos a instância no objeto global para
// que ela seja reutilizada na próxima recarga de módulo.
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Exportamos a instância única para ser usada em todo o restante da aplicação.
export default prisma;