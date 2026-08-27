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
import {
  CreateGroupCommand,
  CreateGroupCommandHandler,
} from '../commands/create-group.command';
import { FindGroupsQuery, FindGroupsQueryHandler } from './find-groups.query';
import { CreateGroupDto } from '../dtos/create-group.dto';

describe('FindGroupsQuery', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateGroupCommandHandler,
        FindGroupsQueryHandler,
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

  it('should find groups', async () => {
    // arrange
    const school1 = await seedSchool(prisma);
    const school2 = await seedSchool(prisma);

    await commandBus.execute(
      new CreateGroupCommand({
        schoolId: school1.id,
        payload: { name: 'Group 11' },
      }),
    );
    await commandBus.execute(
      new CreateGroupCommand({
        schoolId: school1.id,
        payload: new CreateGroupDto({ name: 'Group 12' }),
      }),
    );
    await commandBus.execute(
      new CreateGroupCommand({
        schoolId: school2.id,
        payload: new CreateGroupDto({ name: 'Group 21' }),
      }),
    );

    // act
    const result = await queryBus.execute(
      new FindGroupsQuery({ schoolId: school1.id }),
    );

    // assert
    expect(result).toEqual([
      { id: expect.any(String), name: 'Group 11' },
      { id: expect.any(String), name: 'Group 12' },
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
      name: 'Test School',
      timeZone: 'Europe/Moscow',
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
  });
}
