import { type Provider } from '@nestjs/common';
import { PrismaClient, type Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Uow } from 'yuow/core';
import { PrismaEngine } from 'yuow/prisma';

export const testPrismaProvider: Provider = {
  provide: PrismaClient,
  useFactory: async () => {
    const adapter = new PrismaPg({ connectionString: process.env['DB_URL'] });
    const prisma = new PrismaClient({ adapter });

    await prisma.$executeRaw`
      TRUNCATE TABLE
        school, teacher, "group", subject, subject_log,
        lesson, lesson_teacher, outbox
      RESTART IDENTITY CASCADE
    `;

    return prisma;
  },
};

export const testUowProvider: Provider = {
  provide: Uow,
  inject: [PrismaClient],
  useFactory: (prisma: PrismaClient) =>
    new Uow(
      new PrismaEngine<PrismaClient, Prisma.TransactionIsolationLevel>(prisma),
    ),
};
