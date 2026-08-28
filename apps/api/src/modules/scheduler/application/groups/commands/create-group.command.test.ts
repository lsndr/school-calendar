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
  CreateGroupCommand,
  CreateGroupCommandHandler,
} from './create-group.command';
import {
  FindGroupQuery,
  FindGroupQueryHandler,
} from '../queries/find-group.query';
import { CreateGroupDto } from '../dtos/create-group.dto';

describe('CreateGroupCommand', () => {
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

  it('should create a group', async () => {
    // arrange
    const school = await seedSchool(prisma);

    // act
    const result = await commandBus.execute(
      new CreateGroupCommand({
        schoolId: school.id,
        payload: new CreateGroupDto({ name: 'Test Group' }),
      }),
    );

    // assert
    const result2 = await queryBus.execute(
      new FindGroupQuery({ schoolId: school.id, id: result.id }),
    );

    expect(result).toEqual(result2);
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test Group',
    });
  });

  it('should fail to create a group if school not found', async () => {
    // act
    const result = () =>
      commandBus.execute(
        new CreateGroupCommand({
          schoolId: 'wrong-school-id',
          payload: new CreateGroupDto({ name: 'Test Group' }),
        }),
      );

    // assert
    await expect(result).rejects.toThrowError('School not found');
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
