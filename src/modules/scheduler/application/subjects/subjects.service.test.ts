import { SubjectsService } from './subjects.service';
import { Test } from '@nestjs/testing';
import { TimeIntervalDto } from './time-interval.dto';
import { Group, GroupId, School, SchoolId, TimeZone } from '../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { WeeklyRecurrenceDto } from './weekly-recurrence.dto';
import { testMikroormProvider } from '../../../../../test-utils';
import { CreateSubjectDto } from './create-subject.dto';
import { DailyRecurrenceDto } from './daily-recurrence.dto';
import { MonthlyRecurrenceDto } from './monthly-recurrence.dto';

describe('Subjects Service', () => {
  let subjectsService: SubjectsService;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [SubjectsService, testMikroormProvider],
    }).compile();

    subjectsService = moduleRef.get(SubjectsService);
    orm = moduleRef.get(MikroORM);
  });

  it('should create a subject with weekly periodicity', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-22T12:48:38.529Z'));

    const school = await seedSchool(orm);
    const group = await seedGroup(school, orm);
    const knex = orm.em.getConnection().getKnex();

    const result = await subjectsService.create(
      group.schoolId.value,
      new CreateSubjectDto({
        name: 'Test Subject',
        recurrence: new WeeklyRecurrenceDto({
          days: [0, 2, 3],
        }),
        time: new TimeIntervalDto({ startsAt: 0, duration: 120 }),
        groupId: group.id.value,
        requiredTeachers: 3,
      }),
    );

    const result2 = await subjectsService.findOne(school.id.value, result.id);
    const logs = await knex.select('*').from('subject_log');

    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test Subject',
      recurrence: expect.objectContaining({
        type: 'weekly',
        days: [0, 2, 3],
      }),
      time: expect.objectContaining({
        startsAt: 0,
        duration: 120,
      }),
      requiredTeachers: 3,
      groupId: group.id.value,
      createdAt: '2023-01-22T12:48:38.529+00:00',
      updatedAt: '2023-01-22T12:48:38.529+00:00',
    });
    expect(result2).toEqual({
      id: result.id,
      name: 'Test Subject',
      groupId: group.id.value,
      recurrence: expect.objectContaining({
        type: 'weekly',
        days: [0, 2, 3],
      }),
      time: expect.objectContaining({
        startsAt: 0,
        duration: 120,
      }),
      requiredTeachers: 3,
      createdAt: '2023-01-22T12:48:38.529+00:00',
      updatedAt: '2023-01-22T12:48:38.529+00:00',
    });
    expect(logs).toEqual([
      {
        subject_id: result.id,
        name: 'Test Subject',
        recurrence_type: 'weekly',
        recurrence_days: [0, 2, 3],
        recurrence_week1: null,
        recurrence_week2: null,
        time_starts_at: 0,
        time_duration: 120,
        required_teachers: 3,
        created_at: DateTime.fromISO('2023-01-22T12:48:38.529Z'),
      },
    ]);

    jest.useRealTimers();
  });

  it('should fail to create a subject if school not found', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-22T12:48:38.529Z'));

    const school = await seedSchool(orm);
    const group = await seedGroup(school, orm);

    const act = () =>
      subjectsService.create('wrong school id', {
        name: 'Test Subject',
        recurrence: new WeeklyRecurrenceDto({
          days: [0, 2, 3],
        }),
        time: new TimeIntervalDto({ startsAt: 0, duration: 120 }),
        groupId: group.id.value,
        requiredTeachers: 3,
      });

    await expect(act).rejects.toThrowError('School not found');

    jest.useRealTimers();
  });

  it('should find schools', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-22T12:48:38.529Z'));

    const school1 = await seedSchool(orm);
    const school2 = await seedSchool(orm);
    const group1 = await seedGroup(school1, orm);
    const group2 = await seedGroup(school1, orm);
    const group3 = await seedGroup(school2, orm);

    await subjectsService.create(
      group1.schoolId.value,
      new CreateSubjectDto({
        name: 'Test Subject 1',
        recurrence: new WeeklyRecurrenceDto({
          days: [0, 2, 3],
        }),
        time: new TimeIntervalDto({ startsAt: 0, duration: 120 }),
        groupId: group1.id.value,
        requiredTeachers: 3,
      }),
    );

    await subjectsService.create(
      group2.schoolId.value,
      new CreateSubjectDto({
        name: 'Test Subject 2',
        recurrence: new MonthlyRecurrenceDto({
          days: [0, 2, 3],
        }),
        time: new TimeIntervalDto({ startsAt: 630, duration: 240 }),
        groupId: group2.id.value,
        requiredTeachers: 2,
      }),
    );

    await subjectsService.create(
      group3.schoolId.value,
      new CreateSubjectDto({
        name: 'Test Subject 3',
        recurrence: new DailyRecurrenceDto(),
        time: new TimeIntervalDto({ startsAt: 400, duration: 200 }),
        groupId: group3.id.value,
        requiredTeachers: 2,
      }),
    );

    const result = await subjectsService.findMany(school1.id.value);

    expect(result).toEqual([
      {
        groupId: group1.id.value,
        createdAt: '2023-01-22T12:48:38.529+00:00',
        id: expect.any(String),
        name: 'Test Subject 1',
        recurrence: new WeeklyRecurrenceDto({
          days: [0, 2, 3],
        }),
        requiredTeachers: 3,
        time: new TimeIntervalDto({
          duration: 120,
          startsAt: 0,
        }),
        updatedAt: '2023-01-22T12:48:38.529+00:00',
      },
      {
        groupId: group2.id.value,
        createdAt: '2023-01-22T12:48:38.529+00:00',
        id: expect.any(String),
        name: 'Test Subject 2',
        recurrence: new MonthlyRecurrenceDto({
          days: [0, 2, 3],
        }),
        requiredTeachers: 2,
        time: new TimeIntervalDto({
          duration: 240,
          startsAt: 630,
        }),
        updatedAt: '2023-01-22T12:48:38.529+00:00',
      },
    ]);

    jest.useRealTimers();
  });

  afterEach(async () => {
    await orm.close();
  });
});

async function seedSchool(orm: MikroORM) {
  const id = SchoolId.create();

  const school = School.create({
    id,
    name: 'School Name',
    timeZone: TimeZone.create('Europe/Moscow'),
    now: DateTime.now(),
  });

  const schoolRepository = orm.em.fork().getRepository(School);
  await schoolRepository.persistAndFlush(school);

  return school;
}

async function seedGroup(school: School, orm: MikroORM) {
  const id = GroupId.create();
  const group = Group.create({
    id,
    name: 'Group Name',
    school: school,
    now: DateTime.now(),
  });

  const groupRepository = orm.em.fork().getRepository(Group);
  await groupRepository.persistAndFlush(group);

  return group;
}
