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
import { CqrsModule, CommandBus, QueryBus } from '../../../../shared/cqrs';
import {
  FindLessonQuery,
  FindLessonQueryHandler,
} from '../queries/find-lesson.query';
import {
  AssignTeachersCommand,
  AssignTeachersCommandHandler,
} from './assign-teachers.command';
import { AssignTeachersDto } from '../dtos/assign-teachers.dto';

describe('AssignTeachersCommand', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        AssignTeachersCommandHandler,
        FindLessonQueryHandler,
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

  afterEach(async () => {
    await prisma.$disconnect();
  });

  it('should assign a teacher to a lesson', async () => {
    // arrange
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-23T14:00:28.460Z'));

    const school = await seedSchool(prisma);
    const group = await seedGroup(school.id, prisma);
    const subject = await seedSubject(school.id, group.id, prisma);
    const teacher = await seedTeacher(school.id, prisma);
    await seedLesson(school.id, subject.id, '2023-01-27', prisma);

    vi.setSystemTime(new Date('2023-01-24T01:00:28.460Z'));

    // act
    const result = await commandBus.execute(
      new AssignTeachersCommand({
        schoolId: school.id,
        subjectId: subject.id,
        date: '2023-01-27',
        payload: new AssignTeachersDto({ teacherIds: [teacher.id] }),
      }),
    );

    const result2 = await queryBus.execute(
      new FindLessonQuery({
        schoolId: school.id,
        subjectId: subject.id,
        date: '2023-01-27',
      }),
    );
    const outboxEntries = await prisma.outbox.findMany();

    // assert
    expect(result).toEqual([
      {
        assignedAt: '2023-01-24T01:00:28.460+00:00',
        teacherId: teacher.id,
      },
    ]);
    expect(result2).toEqual({
      date: '2023-01-27',
      subjectId: subject.id,
      createdAt: '2023-01-23T14:00:28.460+00:00',
      updatedAt: '2023-01-24T01:00:28.460+00:00',
      assignedTeachers: [
        {
          assignedAt: '2023-01-24T01:00:28.460+00:00',
          teacherId: teacher.id,
        },
      ],
      time: expect.objectContaining({ duration: 123, startsAt: 45 }),
    });
    expect(outboxEntries).toEqual([
      {
        id: expect.any(String),
        topic: 'scheduler.LessonUpdatedEvent',
        payload: {
          createdAt: '2023-01-23T14:00:28.460+00:00',
          teacherIds: [teacher.id],
          id: {
            date: { day: 27, month: 1, year: 2023 },
            subjectId: subject.id,
          },
          time: { duration: 123, startsAt: 45 },
          updatedAt: '2023-01-24T01:00:28.460+00:00',
        },
        createdAt: new Date('2023-01-24T01:00:28.460Z'),
        processedAt: null,
      },
    ]);

    vi.useRealTimers();
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

async function seedSubject(
  schoolId: string,
  groupId: string,
  prisma: PrismaClient,
) {
  const now = DateTime.now().toJSDate();

  return prisma.subject.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Test Subject',
      schoolId,
      groupId,
      recurrenceType: 'weekly',
      recurrenceDays: [1, 2, 4],
      recurrenceWeek1: [],
      recurrenceWeek2: [],
      timeStartsAt: 120,
      timeDuration: 60,
      requiredTeachers: 3,
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
  });
}

async function seedTeacher(schoolId: string, prisma: PrismaClient) {
  const now = DateTime.now().toJSDate();

  return prisma.teacher.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Test Teacher',
      schoolId,
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
  });
}

async function seedLesson(
  schoolId: string,
  subjectId: string,
  date: string,
  prisma: PrismaClient,
) {
  const [year, month, day] = date.split('-').map(Number);
  const now = DateTime.now().toJSDate();

  return prisma.lesson.create({
    data: {
      id: crypto.randomUUID(),
      schoolId,
      subjectId,
      date: new Date(Date.UTC(year, month - 1, day)),
      timeStartsAt: 45,
      timeDuration: 123,
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
  });
}
