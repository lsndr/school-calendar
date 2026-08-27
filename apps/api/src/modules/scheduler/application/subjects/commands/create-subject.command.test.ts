import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
  CreateSubjectCommand,
  CreateSubjectCommandHandler,
} from './create-subject.command';
import {
  FindSubjectQuery,
  FindSubjectQueryHandler,
} from '../queries/find-subject.query';
import { WeeklyRecurrenceDto } from '../dtos/weekly-recurrence.dto';
import { CreateSubjectDto } from '../dtos/create-subject.dto';
import { TimeIntervalDto } from '../../shared';

describe('CreateSubjectCommand', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateSubjectCommandHandler,
        FindSubjectQueryHandler,
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

  it('should create a subject with weekly recurrence', async () => {
    // arrange
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-22T12:48:38.529Z'));

    const school = await seedSchool(prisma);
    const group = await seedGroup(school.id, prisma);

    // act
    const result = await commandBus.execute(
      new CreateSubjectCommand({
        schoolId: group.schoolId,
        payload: new CreateSubjectDto({
          name: 'Test Subject',
          recurrence: new WeeklyRecurrenceDto({ days: [0, 2, 3] }),
          time: new TimeIntervalDto({ startsAt: 0, duration: 120 }),
          groupId: group.id,
          requiredTeachers: 3,
        }),
      }),
    );

    const result2 = await queryBus.execute(
      new FindSubjectQuery({ schoolId: school.id, id: result.id }),
    );
    const logs = await prisma.subjectLog.findMany();

    // assert
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test Subject',
      recurrence: expect.objectContaining({ type: 'weekly', days: [0, 2, 3] }),
      time: expect.objectContaining({ startsAt: 0, duration: 120 }),
      requiredTeachers: 3,
      groupId: group.id,
      createdAt: '2023-01-22T12:48:38.529+00:00',
      updatedAt: '2023-01-22T12:48:38.529+00:00',
    });
    expect(result2).toEqual({
      id: result.id,
      name: 'Test Subject',
      groupId: group.id,
      recurrence: expect.objectContaining({ type: 'weekly', days: [0, 2, 3] }),
      time: expect.objectContaining({ startsAt: 0, duration: 120 }),
      requiredTeachers: 3,
      createdAt: '2023-01-22T12:48:38.529+00:00',
      updatedAt: '2023-01-22T12:48:38.529+00:00',
    });
    expect(logs).toEqual([
      expect.objectContaining({
        subjectId: result.id,
        name: 'Test Subject',
        recurrenceType: 'weekly',
        recurrenceDays: [0, 2, 3],
        recurrenceWeek1: [],
        recurrenceWeek2: [],
        timeStartsAt: 0,
        timeDuration: 120,
        requiredTeachers: 3,
        createdAt: new Date('2023-01-22T12:48:38.529Z'),
      }),
    ]);

    vi.useRealTimers();
  });

  it('should fail to create a subject if school not found', async () => {
    // arrange
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-22T12:48:38.529Z'));

    const school = await seedSchool(prisma);
    const group = await seedGroup(school.id, prisma);

    // act
    const act = () =>
      commandBus.execute(
        new CreateSubjectCommand({
          schoolId: 'wrong school id',
          payload: {
            name: 'Test Subject',
            recurrence: new WeeklyRecurrenceDto({ days: [0, 2, 3] }),
            time: new TimeIntervalDto({ startsAt: 0, duration: 120 }),
            groupId: group.id,
            requiredTeachers: 3,
          },
        }),
      );

    // assert
    await expect(act).rejects.toThrowError('School not found');

    vi.useRealTimers();
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

async function seedGroup(schoolId: string, prisma: PrismaClient) {
  const now = DateTime.now().toJSDate();

  return prisma.group.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Group Name',
      schoolId,
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
  });
}
