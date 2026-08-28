import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { Uow } from 'yuow/core';
import {
  testPrismaProvider,
  testUowProvider,
  setupUowContext,
} from '../../../../shared/tests';
import { CommandBus, QueryBus, CqrsModule } from '../../../../shared/cqrs';
import {
  CreateSchoolCommand,
  CreateSchoolCommandHandler,
} from './create-school.command';
import { CreateSchoolDto } from '../dtos/create-school.dto';
import {
  FindSchoolQuery,
  FindSchoolQueryHandler,
} from '../queries/find-school.query';

describe('CreateSchoolCommand', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateSchoolCommandHandler,
        FindSchoolQueryHandler,
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

  it('should create a school', async () => {
    // arrange
    const result = await commandBus.execute(
      new CreateSchoolCommand({
        payload: new CreateSchoolDto({
          name: 'Test School',
          timeZone: 'Europe/Moscow',
        }),
      }),
    );

    // act
    const result2 = await queryBus.execute(
      new FindSchoolQuery({ id: result.id }),
    );

    // assert
    expect(result).toEqual(result2);
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test School',
      timeZone: 'Europe/Moscow',
    });
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });
});
