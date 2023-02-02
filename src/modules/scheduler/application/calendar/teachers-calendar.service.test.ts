import { MikroORM } from '@mikro-orm/postgresql';
import { Test } from '@nestjs/testing';
import { DateTime } from 'luxon';
import { testMikroormProvider } from '../../../../../test-utils';
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
} from '../../domain';
import { LessonsLoader } from './lessons.loader';
import { TeachersCalendarLoader } from './teachers-calendar.loader';
import { TeachersCalendarQueryDto } from './teachers-calendar.query.dto';
import { TeachersCalendarService } from './teachers-calendar.service';
import { SubjectVersionsLoader } from './subject-versions.loader';

describe('TeachersCalendarService', () => {
  let service: TeachersCalendarService;
  let orm: MikroORM;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [
        TeachersCalendarService,
        TeachersCalendarLoader,
        SubjectVersionsLoader,
        LessonsLoader,
        testMikroormProvider,
      ],
    }).compile();

    service = moduleRef.get(TeachersCalendarService);
    orm = moduleRef.get(MikroORM);
  });

  afterAll(async () => {
    await orm.close();
  });

  it('should properly load events for a day', async () => {
    const { school1, dailySubject1, teacher1 } = await seedDaily(orm);

    const result = await service.getForPeriod(
      school1.id.value,
      new TeachersCalendarQueryDto({
        startDate: '2023-01-01',
        days: 1,
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
          startsAt: '2023-01-01T16:00:00.000+03:00',
          subjectId: dailySubject1.id.value,
        },
        {
          assignedTeachers: 0,
          duration: 120,
          name: 'Daily Subject 1',
          requiredTeachers: 3,
          startsAt: '2023-01-01T16:00:00.000+03:00',
          subjectId: dailySubject1.id.value,
        },
        {
          assignedTeachers: 0,
          duration: 120,
          name: 'Daily Subject 1',
          requiredTeachers: 3,
          startsAt: '2023-01-01T16:00:00.000+03:00',
          subjectId: dailySubject1.id.value,
        },
      ],
    });
  });
});

async function seedDaily(orm: MikroORM) {
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

  em.persist(school1);
  em.persist(group1);
  em.persist(teacher1);
  em.persist(dailySubject1);

  await em.flush();

  return {
    school1,
    group1,
    teacher1,
    dailySubject1,
  };
}
