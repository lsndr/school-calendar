import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import { DateTime } from 'luxon';
import { PrismaClient } from '@prisma/client';
import { LessonsLoader } from './lessons.loader';
import { testPrismaProvider } from '../../../../shared/tests';

describe('LessonsLoader', () => {
  let loader: LessonsLoader;
  let prisma: PrismaClient;

  let schoolId: string;
  let subject1Id: string;
  let subject2Id: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [LessonsLoader, testPrismaProvider],
    }).compile();

    loader = moduleRef.get(LessonsLoader);
    prisma = moduleRef.get(PrismaClient);
  });

  beforeAll(async () => {
    const now = DateTime.fromISO('2023-01-25T11:48:38', {
      zone: 'Europe/Moscow',
    });

    schoolId = crypto.randomUUID();
    const groupId = crypto.randomUUID();
    subject1Id = crypto.randomUUID();
    subject2Id = crypto.randomUUID();
    const lesson1Id = crypto.randomUUID();
    const lesson2Id = crypto.randomUUID();

    await prisma.school.create({
      data: {
        id: schoolId,
        name: 'Test School',
        timeZone: 'Europe/Moscow',
        version: 1,
        createdAt: now.toJSDate(),
        updatedAt: now.toJSDate(),
      },
    });

    await prisma.group.create({
      data: {
        id: groupId,
        name: 'Test Group',
        schoolId,
        version: 1,
        createdAt: now.toJSDate(),
        updatedAt: now.toJSDate(),
      },
    });

    const subject1CreatedAt = now.minus({ days: 2 }).toJSDate();
    const subject2CreatedAt = now.minus({ weeks: 4 }).toJSDate();

    await prisma.subject.create({
      data: {
        id: subject1Id,
        name: 'Subject 1',
        schoolId,
        groupId,
        recurrenceType: 'daily',
        recurrenceDays: [],
        recurrenceWeek1: [],
        recurrenceWeek2: [],
        timeStartsAt: 720,
        timeDuration: 60,
        requiredTeachers: 2,
        version: 1,
        createdAt: subject1CreatedAt,
        updatedAt: subject1CreatedAt,
      },
    });

    await prisma.subject.create({
      data: {
        id: subject2Id,
        name: 'Subject 2',
        schoolId,
        groupId,
        recurrenceType: 'weekly',
        recurrenceDays: [0, 4],
        recurrenceWeek1: [],
        recurrenceWeek2: [],
        timeStartsAt: 960,
        timeDuration: 120,
        requiredTeachers: 1,
        version: 1,
        createdAt: subject2CreatedAt,
        updatedAt: subject2CreatedAt,
      },
    });

    await prisma.lesson.create({
      data: {
        id: lesson1Id,
        subjectId: subject1Id,
        schoolId,
        date: new Date(Date.UTC(2023, 0, 26)),
        timeStartsAt: 720,
        timeDuration: 60,
        version: 1,
        createdAt: now.toJSDate(),
        updatedAt: now.toJSDate(),
      },
    });

    await prisma.lesson.create({
      data: {
        id: lesson2Id,
        subjectId: subject2Id,
        schoolId,
        date: new Date(Date.UTC(2023, 0, 27)),
        timeStartsAt: 0,
        timeDuration: 120,
        version: 1,
        createdAt: now.toJSDate(),
        updatedAt: now.toJSDate(),
      },
    });
  });

  it('should load lessons in date range', async () => {
    const lessons = await loader.load({
      timeZone: 'Europe/Moscow',
      schoolId,
      from: DateTime.fromISO('2023-01-26T00:00:00', {
        zone: 'Europe/Moscow',
      }),
      to: DateTime.fromISO('2023-01-29T00:00:00', {
        zone: 'Europe/Moscow',
      }),
    });

    expect(Array.from(lessons)).toEqual([
      {
        date: DateTime.fromISO('2023-01-26T00:00:00', {
          zone: 'Europe/Moscow',
        }),
        duration: 60,
        teacherIds: [],
        startsAt: 720,
        subjectId: subject1Id,
      },
      {
        date: DateTime.fromISO('2023-01-27T00:00:00', {
          zone: 'Europe/Moscow',
        }),
        duration: 120,
        teacherIds: [],
        startsAt: 0,
        subjectId: subject2Id,
      },
    ]);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
