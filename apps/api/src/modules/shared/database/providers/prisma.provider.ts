import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { type Provider } from '@nestjs/common';

export const prismaProvider: Provider = {
  provide: PrismaClient,
  useFactory: () => {
    const adapter = new PrismaPg({ connectionString: process.env['DB_URL'] });
    return new PrismaClient({ adapter });
  },
};
