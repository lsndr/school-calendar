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
  UpdateSubjectCommand,
  UpdateSubjectCommandHandler,
} from './update-subject.command';
import {
  FindSubjectQuery,
  FindSubjectQueryHandler,
} from '../queries/find-subject.query';
import { WeeklyRecurrenceDto } from '../dtos/weekly-recurrence.dto';
import { CreateSubjectDto } from '../dtos/create-subject.dto';
import {
  CreateSubjectCommand,
  CreateSubjectCommandHandler,
} from './create-subject.command';
import { UpdateSubjectDto } from '../dtos/update-subject.dto';
import { DailyRecurrenceDto } from '../dtos/daily-recurrence.dto';
import { TimeIntervalDto } from '../../shared';

describe('UpdateSubjectCommand', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateSubjectCommandHandler,
        UpdateSubjectCommandHandler,
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

  it('should update subject', async () => {
    // arrange
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-22T12:48:38.529Z'));

    const school = await seedSchool(prisma);
    const group = await seedGroup(school.id, prisma);

    const subject = await commandBus.execute(
      new CreateSubjectCommand({
        schoolId: group.schoolId,
        payload: new CreateSubjectDto({
          name: 'Old Name',
          recurrence: new WeeklyRecurrenceDto({ days: [0, 2, 3] }),
          time: new TimeIntervalDto({ startsAt: 0, duration: 120 }),
          groupId: group.id,
          requiredTeachers: 3,
        }),
      }),
    );

    vi.setSystemTime(new Date('2023-01-23T15:12:45.529Z'));

    // act
    const result = await commandBus.execute(
      new UpdateSubjectCommand({
        schoolId: group.schoolId,
        id: subject.id,
        payload: new UpdateSubjectDto({
          name: 'New name',
          recurrence: new DailyRecurrenceDto(),
          time: new TimeIntervalDto({ startsAt: 600, duration: 200 }),
          requiredTeachers: 1,
        }),
      }),
    );

    if (!result) {
      throw new Error('Not found');
    }

    // assert
    const result2 = await queryBus.execute(
      new FindSubjectQuery({ schoolId: school.id, id: result.id }),
    );
    const logs = await prisma.subjectLog.findMany({
      orderBy: { createdAt: 'asc' },
    });

    expect(result).toEqual({
      id: subject.id,
      name: 'New name',
      recurrence: expect.objectContaining({ type: 'daily' }),
      time: expect.objectContaining({ startsAt: 600, duration: 200 }),
      requiredTeachers: 1,
      groupId: subject.groupId,
      createdAt: '2023-01-22T12:48:38.529+00:00',
      updatedAt: '2023-01-23T15:12:45.529+00:00',
    });
    expect(result2).toEqual(result);
    expect(logs).toEqual([
      expect.objectContaining({
        subjectId: result.id,
        name: 'Old Name',
        recurrenceType: 'weekly',
        recurrenceDays: [0, 2, 3],
        recurrenceWeek1: [],
        recurrenceWeek2: [],
        timeStartsAt: 0,
        timeDuration: 120,
        requiredTeachers: 3,
        createdAt: new Date('2023-01-22T12:48:38.529Z'),
      }),
      expect.objectContaining({
        subjectId: result.id,
        name: 'New name',
        recurrenceType: 'daily',
        recurrenceDays: [],
        recurrenceWeek1: [],
        recurrenceWeek2: [],
        timeStartsAt: 600,
        timeDuration: 200,
        requiredTeachers: 1,
        createdAt: new Date('2023-01-23T15:12:45.529Z'),
      }),
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
