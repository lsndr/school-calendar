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
import { CommandBus, CqrsModule, QueryBus } from '../../../../shared/cqrs';
import {
  FindSubjectsQuery,
  FindSubjectsQueryHandler,
} from './find-subjects.query';
import {
  CreateSubjectCommand,
  CreateSubjectCommandHandler,
} from '../commands/create-subject.command';
import { CreateSubjectDto } from '../dtos/create-subject.dto';
import { WeeklyRecurrenceDto } from '../dtos/weekly-recurrence.dto';
import { DailyRecurrenceDto } from '../dtos/daily-recurrence.dto';
import { MonthlyRecurrenceDto } from '../dtos/monthly-recurrence.dto';
import { TimeIntervalDto } from '../../shared';

describe('FindSubjectsQuery', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        FindSubjectsQueryHandler,
        CreateSubjectCommandHandler,
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

  it('should find subjects', async () => {
    // arrange
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-22T12:48:38.529Z'));

    const school1 = await seedSchool(prisma);
    const school2 = await seedSchool(prisma);
    const group1 = await seedGroup(school1.id, prisma);
    const group2 = await seedGroup(school1.id, prisma);
    const group3 = await seedGroup(school2.id, prisma);

    await commandBus.execute(
      new CreateSubjectCommand({
        schoolId: group1.schoolId,
        payload: new CreateSubjectDto({
          name: 'Test Subject 1',
          recurrence: new WeeklyRecurrenceDto({ days: [0, 2, 3] }),
          time: new TimeIntervalDto({ startsAt: 0, duration: 120 }),
          groupId: group1.id,
          requiredTeachers: 3,
        }),
      }),
    );

    await commandBus.execute(
      new CreateSubjectCommand({
        schoolId: group2.schoolId,
        payload: new CreateSubjectDto({
          name: 'Test Subject 2',
          recurrence: new MonthlyRecurrenceDto({ days: [0, 2, 3] }),
          time: new TimeIntervalDto({ startsAt: 630, duration: 240 }),
          groupId: group2.id,
          requiredTeachers: 2,
        }),
      }),
    );

    await commandBus.execute(
      new CreateSubjectCommand({
        schoolId: group3.schoolId,
        payload: new CreateSubjectDto({
          name: 'Test Subject 3',
          recurrence: new DailyRecurrenceDto(),
          time: new TimeIntervalDto({ startsAt: 400, duration: 200 }),
          groupId: group3.id,
          requiredTeachers: 2,
        }),
      }),
    );

    // act
    const result = await queryBus.execute(
      new FindSubjectsQuery({ schoolId: school1.id }),
    );

    // assert
    expect(result).toEqual([
      {
        groupId: group1.id,
        createdAt: '2023-01-22T12:48:38.529+00:00',
        id: expect.any(String),
        name: 'Test Subject 1',
        recurrence: new WeeklyRecurrenceDto({ days: [0, 2, 3] }),
        requiredTeachers: 3,
        time: new TimeIntervalDto({ duration: 120, startsAt: 0 }),
        updatedAt: '2023-01-22T12:48:38.529+00:00',
      },
      {
        groupId: group2.id,
        createdAt: '2023-01-22T12:48:38.529+00:00',
        id: expect.any(String),
        name: 'Test Subject 2',
        recurrence: new MonthlyRecurrenceDto({ days: [0, 2, 3] }),
        requiredTeachers: 2,
        time: new TimeIntervalDto({ duration: 240, startsAt: 630 }),
        updatedAt: '2023-01-22T12:48:38.529+00:00',
      },
    ]);

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
