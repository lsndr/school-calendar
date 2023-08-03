import { MikroORM } from '@mikro-orm/postgresql';
import { Test } from '@nestjs/testing';
import { DateTime } from 'luxon';
import { testMikroormProvider } from '@shared/tests';
import {
  Group,
  GroupId,
  DailyRecurrence,
  Teacher,
  TeacherId,
  School,
  SchoolId,
  RequiredTeachers,
  TimeInterval,
  TimeZone,
  Subject,
  SubjectId,
  WeeklyRecurrence,
} from '../../../domain';
import { LessonsLoader } from './../services/lessons.loader';
import { TeachersCalendarLoader } from './../services/teachers-calendar.loader';
import { TeachersCalendarFiltersDto } from '../dtos/teachers-calendar-filters.dto';
import { QueryBus, CqrsModule } from '@shared/cqrs';
import {
  GetTeachersCalendarQuery,
  GetTeachersCalendarQueryHandler,
} from './get-teachers-calendar.query';
import { SubjectVersionsLoader } from '../services/subject-versions.loader';

describe('GetTeachersCalendarQuery', () => {
  let queryBus: QueryBus;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        GetTeachersCalendarQueryHandler,
        LessonsLoader,
        SubjectVersionsLoader,
        TeachersCalendarLoader,
        testMikroormProvider,
      ],
    }).compile();

    queryBus = moduleRef.get(QueryBus);
    orm = moduleRef.get(MikroORM);

    await moduleRef.createNestApplication().init();
  });

  afterEach(async () => {
    await orm.close();
  });

  describe('Day', () => {
    it('should properly load events for 2023-01-02', async () => {
      const { school1, dailySubject1, teacher1 } = await seedDay(orm);

      const result = await queryBus.execute(
        new GetTeachersCalendarQuery({
          schoolId: school1.id.value,
          filters: new TeachersCalendarFiltersDto({
            startDate: '2023-01-02',
            days: 1,
          }),
        }),
      );

      expect(result).toEqual({
        teachers: [
          {
            id: teacher1.id.value,
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
            subjectId: dailySubject1.id.value,
          },
          {
            assignedTeachers: 0,
            duration: 120,
            name: 'Daily Subject 1',
            requiredTeachers: 3,
            startsAt: '2023-01-02T16:00:00.000+03:00',
            subjectId: dailySubject1.id.value,
          },
          {
            assignedTeachers: 0,
            duration: 120,
            name: 'Daily Subject 1',
            requiredTeachers: 3,
            startsAt: '2023-01-02T16:00:00.000+03:00',
            subjectId: dailySubject1.id.value,
          },
        ],
      });
    });

    it('should properly load events for 2023-01-09', async () => {
      const { school1, dailySubject1, weeklySubject1, teacher1 } =
        await seedDay(orm);

      const result = await queryBus.execute(
        new GetTeachersCalendarQuery({
          schoolId: school1.id.value,
          filters: new TeachersCalendarFiltersDto({
            startDate: '2023-01-09',
            days: 1,
          }),
        }),
      );

      expect(result).toEqual({
        teachers: [
          {
            id: teacher1.id.value,
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
            subjectId: weeklySubject1.id.value,
          },
          {
            assignedTeachers: 0,
            duration: 120,
            teacherId: undefined,
            name: 'Daily Subject 1',
            requiredTeachers: 3,
            startsAt: '2023-01-09T16:00:00.000+03:00',
            subjectId: dailySubject1.id.value,
          },
          {
            assignedTeachers: 0,
            duration: 120,
            teacherId: undefined,
            name: 'Daily Subject 1',
            requiredTeachers: 3,
            startsAt: '2023-01-09T16:00:00.000+03:00',
            subjectId: dailySubject1.id.value,
          },
          {
            assignedTeachers: 0,
            duration: 120,
            teacherId: undefined,
            name: 'Daily Subject 1',
            requiredTeachers: 3,
            startsAt: '2023-01-09T16:00:00.000+03:00',
            subjectId: dailySubject1.id.value,
          },
        ],
      });
    });
  });
});

async function seedDay(orm: MikroORM) {
  const em = orm.em.fork();

  const school1 = School.create({
    id: SchoolId.create(),
    name: 'School 1',
    now: DateTime.fromISO('2022-12-05T09:12:56', {
      zone: 'Europe/Moscow',
    }),
    timeZone: TimeZone.create('Europe/Moscow'),
  });

  const group1 = Group.create({
    id: GroupId.create(),
    school: school1,
    name: 'Group 1',
    now: DateTime.fromISO('2022-12-05T09:23:12', {
      zone: 'Europe/Moscow',
    }),
  });

  const teacher1 = Teacher.create({
    id: TeacherId.create(),
    school: school1,
    name: 'Teacher 1',
    now: DateTime.fromISO('2022-12-05T09:25:09', {
      zone: 'Europe/Moscow',
    }),
  });

  const dailySubject1 = Subject.create({
    id: SubjectId.create(),
    name: 'Daily Subject 1',
    school: school1,
    group: group1,
    recurrence: DailyRecurrence.create(),
    time: TimeInterval.create({
      startsAt: 960,
      duration: 120,
    }),
    requiredTeachers: RequiredTeachers.create(3),
    now: DateTime.fromISO('2022-12-05T12:04:04', {
      zone: 'Europe/Moscow',
    }),
  });

  const weeklySubject1 = Subject.create({
    id: SubjectId.create(),
    name: 'Weekly Subject 1',
    school: school1,
    group: group1,
    recurrence: WeeklyRecurrence.create([0]),
    time: TimeInterval.create({
      startsAt: 960,
      duration: 120,
    }),
    requiredTeachers: RequiredTeachers.create(1),
    now: DateTime.fromISO('2023-01-03T13:00:00', {
      zone: 'Europe/Moscow',
    }),
  });

  em.persist(school1);
  em.persist(group1);
  em.persist(teacher1);
  em.persist(dailySubject1);
  em.persist(weeklySubject1);

  await em.flush();

  return {
    school1,
    group1,
    teacher1,
    dailySubject1,
    weeklySubject1,
  };
}
