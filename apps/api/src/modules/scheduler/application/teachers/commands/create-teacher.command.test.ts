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
import { CommandBus, QueryBus, CqrsModule } from '../../../../shared/cqrs';
import {
  CreateTeacherCommand,
  CreateTeacherCommandHandler,
} from './create-teacher.command';
import { CreateTeacherDto } from '../dtos/create-teacher.dto';
import {
  FindTeacherQuery,
  FindTeacherQueryHandler,
} from '../queries/find-teacher.query';

describe('CreateTeacherCommand', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateTeacherCommandHandler,
        FindTeacherQueryHandler,
        testPrismaProvider,
        testUowProvider,
      ],
    }).compile();

    commandBus = moduleRef.get(CommandBus);
    queryBus = moduleRef.get(QueryBus);
    prisma = moduleRef.get(PrismaClient);
    const uow = moduleRef.get(Uow);

    await moduleRef.createNestApplication().init();

    setupUowContext({ commandBus, queryBus }, uow);
  });

  it('should create a teacher', async () => {
    // arrange
    const school = await seedSchool(prisma);

    // act
    const result = await commandBus.execute(
      new CreateTeacherCommand({
        schoolId: school.id,
        payload: new CreateTeacherDto({
          name: 'Test Teacher',
        }),
      }),
    );

    const result2 = await queryBus.execute(
      new FindTeacherQuery({
        schoolId: school.id,
        id: result.id,
      }),
    );

    // assert
    expect(result).toEqual(result2);
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test Teacher',
    });
  });

  it('should fail to create a teacher if school not found', async () => {
    // act
    const act = () =>
      commandBus.execute(
        new CreateTeacherCommand({
          schoolId: 'wrong-school-id',
          payload: new CreateTeacherDto({
            name: 'Test Teacher',
          }),
        }),
      );

    // assert
    await expect(act).rejects.toThrowError('School not found');
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
