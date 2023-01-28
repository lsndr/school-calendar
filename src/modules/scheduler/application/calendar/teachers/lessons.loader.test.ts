import { Test } from '@nestjs/testing';
import {
  knexProvider,
  KNEX_PROVIDER,
  uowProvider,
  UOW_PROVIDER,
} from '../../../../shared/database';
import { Knex } from 'knex';
import { recreateDb } from '../../../../../../test-utils';
import { Uow } from 'yuow';
import {
  Lesson,
  LessonId,
  Group,
  GroupId,
  DailyPeriodicity,
  ExactDate,
  School,
  SchoolId,
  RequiredTeachers,
  TimeInterval,
  TimeZone,
  Subject,
  SubjectId,
  WeeklyPeriodicity,
} from '../../../domain';
import { DateTime } from 'luxon';
import {
  LessonRepository,
  GroupRepository,
  SchoolRepository,
  SubjectRepository,
} from '../../../database';
import { LessonsLoader } from './lessons.loader';

describe('LessonsLoader', () => {
  let loader: LessonsLoader;
  let school: School;
  let knex: Knex;
  let uow: Uow;

  let subject1: Subject;
  let subject2: Subject;
  let group: Group;

  let attendace1: Lesson;
  let attendace2: Lesson;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [LessonsLoader, knexProvider, uowProvider],
    }).compile();

    loader = moduleRef.get(LessonsLoader);
    knex = moduleRef.get(KNEX_PROVIDER);
    uow = moduleRef.get(UOW_PROVIDER);
  });

  beforeAll(async () => {
    await recreateDb(knex);
  });

  beforeAll(async () => {
    const now = DateTime.fromISO('2023-01-25T11:48:38', {
      zone: 'Europe/Moscow',
    });

    await uow((ctx) => {
      const schoolRepository = ctx.getRepository(SchoolRepository);
      const groupRepository = ctx.getRepository(GroupRepository);
      const subjectRepository = ctx.getRepository(SubjectRepository);
      const lessonRepository = ctx.getRepository(LessonRepository);

      school = School.create({
        id: SchoolId.create(),
        name: 'Test School',
        timeZone: TimeZone.create('Europe/Moscow'),
        now,
      });

      group = Group.create({
        id: GroupId.create(),
        school,
        name: 'Test Group',
        now,
      });

      subject1 = Subject.create({
        id: SubjectId.create(),
        school,
        name: 'Subject 1',
        periodicity: DailyPeriodicity.create(),
        timeInterval: TimeInterval.create({
          startsAt: 720,
          duration: 60,
        }),
        group,
        requiredTeachers: RequiredTeachers.create(2),
        now: now.minus({ days: 2 }),
      });

      subject2 = Subject.create({
        id: SubjectId.create(),
        school,
        name: 'Subject 2',
        periodicity: WeeklyPeriodicity.create([0, 4]),
        timeInterval: TimeInterval.create({
          startsAt: 960,
          duration: 120,
        }),
        group,
        requiredTeachers: RequiredTeachers.create(1),
        now: now.minus({ weeks: 4 }),
      });

      attendace1 = Lesson.create({
        id: LessonId.create(
          subject1.id,
          ExactDate.create({
            day: 26,
            month: 1,
            year: 2023,
          }),
        ),
        timeInterval: subject1.timeInterval,
        school,
        now,
      });

      attendace2 = Lesson.create({
        id: LessonId.create(
          subject2.id,
          ExactDate.create({
            day: 28,
            month: 1,
            year: 2023,
          }),
        ),
        timeInterval: TimeInterval.create({
          startsAt: 0,
          duration: 120,
        }),
        school,
        now,
      });

      schoolRepository.add(school);
      groupRepository.add(group);
      subjectRepository.add(subject1);
      subjectRepository.add(subject2);
      lessonRepository.add(attendace1);
      lessonRepository.add(attendace2);
    });

    await uow(async (ctx) => {
      const subjectRepository = ctx.getRepository(SubjectRepository);

      const subject = await subjectRepository.findOne({
        id: subject1.id.value,
      });

      if (!subject) {
        throw new Error('Subject Not found');
      }

      subject.setName('Subject 1 Version 2', now);
      subject.setTimeInterval(
        TimeInterval.create({
          startsAt: 120,
          duration: 600,
        }),
        now,
      );
    });
  });

  it('should load subject 1 since subject 1 version 2 starts later', async () => {
    const lessons = await loader.load({
      timeZone: 'Europe/Moscow',
      schoolId: subject1.schoolId.value,
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
        teacherIds: null,
        startsAt: 720,
        subjectId: subject1.id.value,
      },
      {
        date: DateTime.fromISO('2023-01-28T00:00:00', {
          zone: 'Europe/Moscow',
        }),
        duration: 120,
        teacherIds: null,
        startsAt: 0,
        subjectId: subject2.id.value,
      },
    ]);
  });

  afterAll(async () => {
    await knex.destroy();
  });
});
