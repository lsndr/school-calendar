import { Test } from '@nestjs/testing';
import {
  Lesson,
  LessonId,
  Group,
  GroupId,
  DailyRecurrence,
  ExactDate,
  School,
  SchoolId,
  RequiredTeachers,
  TimeInterval,
  TimeZone,
  Subject,
  SubjectId,
  WeeklyRecurrence,
} from '../../../domain';
import { DateTime } from 'luxon';
import { LessonsLoader } from './lessons.loader';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '@shared/tests';

describe('LessonsLoader', () => {
  let loader: LessonsLoader;
  let school: School;
  let orm: MikroORM;

  let subject1: Subject;
  let subject2: Subject;
  let group: Group;

  let attendace1: Lesson;
  let attendace2: Lesson;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [LessonsLoader, testMikroormProvider],
    }).compile();

    loader = moduleRef.get(LessonsLoader);
    orm = moduleRef.get(MikroORM);
  });

  beforeAll(async () => {
    const em = orm.em.fork();

    const now = DateTime.fromISO('2023-01-25T11:48:38', {
      zone: 'Europe/Moscow',
    });

    const schoolRepository = em.getRepository(School);
    const groupRepository = em.getRepository(Group);
    const subjectRepository = em.getRepository(Subject);
    const lessonRepository = em.getRepository(Lesson);

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
      recurrence: DailyRecurrence.create(),
      time: TimeInterval.create({
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
      recurrence: WeeklyRecurrence.create([0, 4]),
      time: TimeInterval.create({
        startsAt: 960,
        duration: 120,
      }),
      group,
      requiredTeachers: RequiredTeachers.create(1),
      now: now.minus({ weeks: 4 }),
    });

    attendace1 = Lesson.create({
      id: LessonId.create(),
      subject: subject1,
      date: ExactDate.create({
        day: 26,
        month: 1,
        year: 2023,
      }),
      time: subject1.time,
      school,
      now,
    });

    attendace2 = Lesson.create({
      id: LessonId.create(),
      subject: subject2,
      date: ExactDate.create({
        day: 27,
        month: 1,
        year: 2023,
      }),
      time: TimeInterval.create({
        startsAt: 0,
        duration: 120,
      }),
      school,
      now,
    });

    schoolRepository.persist(school);
    groupRepository.persist(group);
    subjectRepository.persist(subject1);
    subjectRepository.persist(subject2);
    lessonRepository.persist(attendace1);
    lessonRepository.persist(attendace2);

    await em.flush();
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
        date: DateTime.fromISO('2023-01-27T00:00:00', {
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
    await orm.close();
  });
});
