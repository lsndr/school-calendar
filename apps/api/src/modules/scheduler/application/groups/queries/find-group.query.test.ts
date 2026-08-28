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
import { CqrsModule, CommandBus, QueryBus } from '../../../../shared/cqrs';
import { FindGroupQuery, FindGroupQueryHandler } from './find-group.query';
import {
  CreateGroupCommand,
  CreateGroupCommandHandler,
} from '../commands/create-group.command';
import { CreateGroupDto } from '../dtos/create-group.dto';

describe('FindGroupQuery', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateGroupCommandHandler,
        FindGroupQueryHandler,
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

  it('should find a group', async () => {
    // arrange
    const school = await seedSchool(prisma);

    await commandBus.execute(
      new CreateGroupCommand({
        schoolId: school.id,
        payload: new CreateGroupDto({ name: 'Group 1' }),
      }),
    );
    const result = await commandBus.execute(
      new CreateGroupCommand({
        schoolId: school.id,
        payload: new CreateGroupDto({ name: 'Group 2' }),
      }),
    );

    // act
    const result2 = await queryBus.execute(
      new FindGroupQuery({ schoolId: school.id, id: result.id }),
    );

    // assert
    expect(result2).toEqual({
      id: expect.any(String),
      name: 'Group 2',
    });
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
      name: 'Test School',
      timeZone: 'Europe/Moscow',
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
  });
}
