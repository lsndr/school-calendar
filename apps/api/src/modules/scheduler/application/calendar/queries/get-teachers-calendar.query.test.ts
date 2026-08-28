import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';
import { testPrismaProvider } from '../../../../shared/tests';
import { LessonsLoader } from './../services/lessons.loader';
import { TeachersCalendarLoader } from './../services/teachers-calendar.loader';
import { TeachersCalendarFiltersDto } from '../dtos/teachers-calendar-filters.dto';
import { QueryBus, CqrsModule } from '../../../../shared/cqrs';
import {
  GetTeachersCalendarQuery,
  GetTeachersCalendarQueryHandler,
} from './get-teachers-calendar.query';
import { SubjectVersionsLoader } from '../services/subject-versions.loader';

describe('GetTeachersCalendarQuery', () => {
  let queryBus: QueryBus;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        GetTeachersCalendarQueryHandler,
        LessonsLoader,
        SubjectVersionsLoader,
        TeachersCalendarLoader,
        testPrismaProvider,
      ],
    }).compile();

    queryBus = moduleRef.get(QueryBus);
    prisma = moduleRef.get(PrismaClient);

    await moduleRef.createNestApplication().init();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe('Day', () => {
    it('should properly load events for 2023-01-02', async () => {
      const { school1Id, dailySubject1Id, teacher1Id } = await seedDay(prisma);

      const result = await queryBus.execute(
        new GetTeachersCalendarQuery({
          schoolId: school1Id,
          filters: new TeachersCalendarFiltersDto({
            startDate: '2023-01-02',
            days: 1,
          }),
        }),
      );

      expect(result).toEqual({
        teachers: [
          {
            id: teacher1Id,
            name: 'Teacher 1',
          },
        ],
        events: [
          {
            assignedTeachers: 0,
            duration: 120,
            name: 'Daily Subject 1',
            requiredTeachers: 3,
            startsAt: '2023-01-02T16:00:00.000+03:00',
            subjectId: dailySubject1Id,
          },
          {
            assignedTeachers: 0,
            duration: 120,
            name: 'Daily Subject 1',
            requiredTeachers: 3,
            startsAt: '2023-01-02T16:00:00.000+03:00',
            subjectId: dailySubject1Id,
          },
          {
            assignedTeachers: 0,
            duration: 120,
            name: 'Daily Subject 1',
            requiredTeachers: 3,
            startsAt: '2023-01-02T16:00:00.000+03:00',
            subjectId: dailySubject1Id,
          },
        ],
      });
    });

    it('should properly load events for 2023-01-09', async () => {
      const { school1Id, dailySubject1Id, weeklySubject1Id, teacher1Id } =
        await seedDay(prisma);

      const result = await queryBus.execute(
        new GetTeachersCalendarQuery({
          schoolId: school1Id,
          filters: new TeachersCalendarFiltersDto({
            startDate: '2023-01-09',
            days: 1,
          }),
        }),
      );

      expect(result).toEqual({
        teachers: [
          {
            id: teacher1Id,
            name: 'Teacher 1',
          },
        ],
        events: [
          {
            assignedTeachers: 0,
            duration: 120,
            teacherId: undefined,
            name: 'Weekly Subject 1',
            requiredTeachers: 1,
            startsAt: '2023-01-09T16:00:00.000+03:00',
            subjectId: weeklySubject1Id,
          },
          {
            assignedTeachers: 0,
            duration: 120,
            teacherId: undefined,
            name: 'Daily Subject 1',
            requiredTeachers: 3,
            startsAt: '2023-01-09T16:00:00.000+03:00',
            subjectId: dailySubject1Id,
          },
          {
            assignedTeachers: 0,
            duration: 120,
            teacherId: undefined,
            name: 'Daily Subject 1',
            requiredTeachers: 3,
            startsAt: '2023-01-09T16:00:00.000+03:00',
            subjectId: dailySubject1Id,
          },
          {
            assignedTeachers: 0,
            duration: 120,
            teacherId: undefined,
            name: 'Daily Subject 1',
            requiredTeachers: 3,
            startsAt: '2023-01-09T16:00:00.000+03:00',
            subjectId: dailySubject1Id,
          },
        ],
      });
    });
  });
});

async function seedDay(prisma: PrismaClient) {
  const school1Id = crypto.randomUUID();
  const group1Id = crypto.randomUUID();
  const teacher1Id = crypto.randomUUID();
  const dailySubject1Id = crypto.randomUUID();
  const weeklySubject1Id = crypto.randomUUID();

  const school1CreatedAt = DateTime.fromISO('2022-12-05T09:12:56', {
    zone: 'Europe/Moscow',
  }).toJSDate();
  const group1CreatedAt = DateTime.fromISO('2022-12-05T09:23:12', {
    zone: 'Europe/Moscow',
  }).toJSDate();
  const teacher1CreatedAt = DateTime.fromISO('2022-12-05T09:25:09', {
    zone: 'Europe/Moscow',
  }).toJSDate();
  const dailySubject1CreatedAt = DateTime.fromISO('2022-12-05T12:04:04', {
    zone: 'Europe/Moscow',
  }).toJSDate();
  const weeklySubject1CreatedAt = DateTime.fromISO('2023-01-03T13:00:00', {
    zone: 'Europe/Moscow',
  }).toJSDate();

  await prisma.school.create({
    data: {
      id: school1Id,
      name: 'School 1',
      timeZone: 'Europe/Moscow',
      version: 1,
      createdAt: school1CreatedAt,
      updatedAt: school1CreatedAt,
    },
  });

  await prisma.group.create({
    data: {
      id: group1Id,
      name: 'Group 1',
      schoolId: school1Id,
      version: 1,
      createdAt: group1CreatedAt,
      updatedAt: group1CreatedAt,
    },
  });

  await prisma.teacher.create({
    data: {
      id: teacher1Id,
      name: 'Teacher 1',
      schoolId: school1Id,
      version: 1,
      createdAt: teacher1CreatedAt,
      updatedAt: teacher1CreatedAt,
    },
  });

  await prisma.subject.create({
    data: {
      id: dailySubject1Id,
      name: 'Daily Subject 1',
      schoolId: school1Id,
      groupId: group1Id,
      recurrenceType: 'daily',
      recurrenceDays: [],
      recurrenceWeek1: [],
      recurrenceWeek2: [],
      timeStartsAt: 960,
      timeDuration: 120,
      requiredTeachers: 3,
      version: 1,
      createdAt: dailySubject1CreatedAt,
      updatedAt: dailySubject1CreatedAt,
    },
  });

  await prisma.subjectLog.create({
    data: {
      subjectId: dailySubject1Id,
      name: 'Daily Subject 1',
      recurrenceType: 'daily',
      recurrenceDays: [],
      recurrenceWeek1: [],
      recurrenceWeek2: [],
      timeStartsAt: 960,
      timeDuration: 120,
      requiredTeachers: 3,
      createdAt: dailySubject1CreatedAt,
    },
  });

  await prisma.subject.create({
    data: {
      id: weeklySubject1Id,
      name: 'Weekly Subject 1',
      schoolId: school1Id,
      groupId: group1Id,
      recurrenceType: 'weekly',
      recurrenceDays: [0],
      recurrenceWeek1: [],
      recurrenceWeek2: [],
      timeStartsAt: 960,
      timeDuration: 120,
      requiredTeachers: 1,
      version: 1,
      createdAt: weeklySubject1CreatedAt,
      updatedAt: weeklySubject1CreatedAt,
    },
  });

  await prisma.subjectLog.create({
    data: {
      subjectId: weeklySubject1Id,
      name: 'Weekly Subject 1',
      recurrenceType: 'weekly',
      recurrenceDays: [0],
      recurrenceWeek1: [],
      recurrenceWeek2: [],
      timeStartsAt: 960,
      timeDuration: 120,
      requiredTeachers: 1,
      createdAt: weeklySubject1CreatedAt,
    },
  });

  return {
    school1Id,
    group1Id,
    teacher1Id,
    dailySubject1Id,
    weeklySubject1Id,
  };
}
