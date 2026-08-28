import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { Uow } from 'yuow/core';
import { DateTime } from 'luxon';
import {
  testPrismaProvider,
  testUowProvider,
  setupUowContext,
} from '../../../../shared/tests';
import { CqrsModule, QueryBus } from '../../../../shared/cqrs';
import {
  FindSchoolsQuery,
  FindSchoolsQueryHandler,
} from './find-schools.query';

describe('FindSchoolsQuery', () => {
  let queryBus: QueryBus;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [FindSchoolsQueryHandler, testPrismaProvider, testUowProvider],
    }).compile();

    queryBus = moduleRef.get(QueryBus);
    prisma = moduleRef.get(PrismaClient);
    const uow = moduleRef.get(Uow);

    await moduleRef.createNestApplication().init();

    setupUowContext({ queryBus }, uow);
  });

  it('should find schools', async () => {
    // arrange
    await seed(prisma);

    // act
    const result = await queryBus.execute(new FindSchoolsQuery());

    // assert
    expect(result).toEqual([
      {
        id: expect.any(String),
        name: 'School 1',
        timeZone: 'Europe/Moscow',
      },
      {
        id: expect.any(String),
        name: 'School 2',
        timeZone: 'Europe/London',
      },
    ]);
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });
});

async function seed(prisma: PrismaClient) {
  const now1 = DateTime.fromISO('2023-02-05T19:48:34', {
    zone: 'Europe/Moscow',
  }).toJSDate();
  const now2 = DateTime.fromISO('2023-02-07T10:12:56', {
    zone: 'Europe/London',
  }).toJSDate();

  await prisma.school.createMany({
    data: [
      {
        id: crypto.randomUUID(),
        name: 'School 1',
        timeZone: 'Europe/Moscow',
        version: 1,
        createdAt: now1,
        updatedAt: now1,
      },
      {
        id: crypto.randomUUID(),
        name: 'School 2',
        timeZone: 'Europe/London',
        version: 1,
        createdAt: now2,
        updatedAt: now2,
      },
    ],
  });
}
