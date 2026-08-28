import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import { DateTime } from 'luxon';
import { PrismaClient } from '@prisma/client';
import { SubjectVersionsLoader } from './subject-versions.loader';
import { testPrismaProvider } from '../../../../shared/tests';

describe('SubjectVersionsLoader', () => {
  let loader: SubjectVersionsLoader;
  let prisma: PrismaClient;

  let schoolId: string;
  let groupId: string;
  let subject1Id: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [SubjectVersionsLoader, testPrismaProvider],
    }).compile();

    loader = moduleRef.get(SubjectVersionsLoader);
    prisma = moduleRef.get(PrismaClient);
  });

  beforeAll(async () => {
    const now = DateTime.fromISO('2023-01-25T11:48:38', {
      zone: 'Europe/Moscow',
    });

    schoolId = crypto.randomUUID();
    groupId = crypto.randomUUID();
    subject1Id = crypto.randomUUID();
    const subject2Id = crypto.randomUUID();

    const subject1CreatedAt = now.minus({ days: 2 }).toUTC().toJSDate();
    const subject2CreatedAt = now.minus({ weeks: 4 }).toUTC().toJSDate();
    const subject1UpdatedAt = now.toUTC().toJSDate();

    await prisma.school.create({
      data: {
        id: schoolId,
        name: 'Test School',
        timeZone: 'Europe/Moscow',
        version: 1,
        createdAt: subject1CreatedAt,
        updatedAt: subject1CreatedAt,
      },
    });

    await prisma.group.create({
      data: {
        id: groupId,
        name: 'Test Group',
        schoolId,
        version: 1,
        createdAt: subject1CreatedAt,
        updatedAt: subject1CreatedAt,
      },
    });

    await prisma.subject.create({
      data: {
        id: subject1Id,
        name: 'Subject 1 Version 2',
        schoolId,
        groupId,
        recurrenceType: 'daily',
        recurrenceDays: [],
        recurrenceWeek1: [],
        recurrenceWeek2: [],
        timeStartsAt: 120,
        timeDuration: 600,
        requiredTeachers: 2,
        version: 2,
        createdAt: subject1CreatedAt,
        updatedAt: subject1UpdatedAt,
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

    // subject1 v1 log entry
    await prisma.subjectLog.create({
      data: {
        subjectId: subject1Id,
        name: 'Subject 1',
        recurrenceType: 'daily',
        recurrenceDays: [],
        recurrenceWeek1: [],
        recurrenceWeek2: [],
        timeStartsAt: 720,
        timeDuration: 60,
        requiredTeachers: 2,
        createdAt: subject1CreatedAt,
      },
    });

    // subject2 v1 log entry
    await prisma.subjectLog.create({
      data: {
        subjectId: subject2Id,
        name: 'Subject 2',
        recurrenceType: 'weekly',
        recurrenceDays: [0, 4],
        recurrenceWeek1: [],
        recurrenceWeek2: [],
        timeStartsAt: 960,
        timeDuration: 120,
        requiredTeachers: 1,
        createdAt: subject2CreatedAt,
      },
    });

    // subject1 v2 log entry (after update)
    await prisma.subjectLog.create({
      data: {
        subjectId: subject1Id,
        name: 'Subject 1 Version 2',
        recurrenceType: 'daily',
        recurrenceDays: [],
        recurrenceWeek1: [],
        recurrenceWeek2: [],
        timeStartsAt: 120,
        timeDuration: 600,
        requiredTeachers: 2,
        createdAt: subject1UpdatedAt,
      },
    });
  });

  it('should load subject 1 since subject 1 version 2 starts later', async () => {
    const subjects = await loader.load({
      schoolId,
      timeZone: 'Europe/Moscow',
      from: DateTime.fromISO('2023-01-25T00:00:00', {
        zone: 'Europe/Moscow',
      }),
      to: DateTime.fromISO('2023-01-26T00:00:00', {
        zone: 'Europe/Moscow',
      }),
    });

    expect(Array.from(subjects)).toEqual([
      {
        groupId,
        date: DateTime.fromISO('2023-01-25T00:00:00', {
          zone: 'Europe/Moscow',
        }),
        duration: 60,
        id: subject1Id,
        name: 'Subject 1',
        startsAt: 720,
        requiredTeachers: 2,
      },
    ]);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
