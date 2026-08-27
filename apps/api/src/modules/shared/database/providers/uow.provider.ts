import { Uow } from 'yuow/core';
import { PrismaEngine } from 'yuow/prisma';
import { PrismaClient, type Prisma } from '@prisma/client';
import { type Provider } from '@nestjs/common';

export const uowProvider: Provider = {
  provide: Uow,
  useFactory: (prisma: PrismaClient) =>
    new Uow(
      new PrismaEngine<PrismaClient, Prisma.TransactionIsolationLevel>(prisma),
    ),
  inject: [PrismaClient],
};
