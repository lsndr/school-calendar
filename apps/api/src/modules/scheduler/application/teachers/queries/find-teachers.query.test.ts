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
import { CommandBus, CqrsModule, QueryBus } from '../../../../shared/cqrs';
import {
  CreateTeacherCommand,
  CreateTeacherCommandHandler,
} from '../commands/create-teacher.command';
import { CreateTeacherDto } from '../dtos/create-teacher.dto';
import {
  FindTeachersQuery,
  FindTeachersQueryHandler,
} from './find-teachers.query';

describe('FindTeachersQuery', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        FindTeachersQueryHandler,
        CreateTeacherCommandHandler,
        testPrismaProvider,
        testUowProvider,
      ],
    }).compile();

    queryBus = moduleRef.get(QueryBus);
    commandBus = moduleRef.get(CommandBus);
    prisma = moduleRef.get(PrismaClient);
    const uow = moduleRef.get(Uow);

    await moduleRef.createNestApplication().init();

    setupUowContext({ commandBus, queryBus }, uow);
  });

  it('should find teachers', async () => {
    // arrange
    const school1 = await seedSchool(prisma);
    const school2 = await seedSchool(prisma);

    await commandBus.execute(
      new CreateTeacherCommand({
        schoolId: school1.id,
        payload: new CreateTeacherDto({ name: 'Teacher 11' }),
      }),
    );

    await commandBus.execute(
      new CreateTeacherCommand({
        schoolId: school1.id,
        payload: new CreateTeacherDto({ name: 'Teacher 12' }),
      }),
    );

    await commandBus.execute(
      new CreateTeacherCommand({
        schoolId: school2.id,
        payload: new CreateTeacherDto({ name: 'Teacher 21' }),
      }),
    );

    // act
    const result = await queryBus.execute(
      new FindTeachersQuery({ schoolId: school1.id }),
    );

    expect(result).toEqual([
      { id: expect.any(String), name: 'Teacher 11' },
      { id: expect.any(String), name: 'Teacher 12' },
    ]);
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });
});

async function seedSchool(prisma: PrismaClient) {
  const now = DateTime.now().toJSDate();

  return prisma.school.create({
    data: {
      id: crypto.randomUUID(),
      name: 'School Name',
      timeZone: 'Europe/Moscow',
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
  });
}
