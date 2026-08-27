import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { prismaProvider, uowProvider, UowInterceptor } from './database';
import { CqrsModule } from './cqrs';

@Module({
  imports: [CqrsModule],
  providers: [
    prismaProvider,
    uowProvider,
    { provide: APP_INTERCEPTOR, useClass: UowInterceptor },
  ],
  exports: [prismaProvider, uowProvider, CqrsModule],
})
export class SharedModule {
  public constructor(private readonly prisma: PrismaClient) {}

  public async beforeApplicationShutdown(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
