import { SubjectsService } from './subjects.service';
import { Test } from '@nestjs/testing';
import { MIKROORM_PROVIDER } from '../../../shared/database';
import { TimeIntervalDto } from './time-interval.dto';
import { Group, GroupId, School, SchoolId, TimeZone } from '../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { WeeklyRecurrenceDto } from './weekly-recurrence.dto';
import { testMikroormProvider } from '../../../../../test-utils';

describe('Subjects Service', () => {
  let subjectsService: SubjectsService;
  let school: School;
  let group: Group;
  let orm: MikroORM;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [SubjectsService, testMikroormProvider],
    }).compile();

    subjectsService = moduleRef.get(SubjectsService);
    orm = moduleRef.get(MIKROORM_PROVIDER);
  });

  beforeEach(async () => {
    const id = SchoolId.create();

    school = School.create({
      id,
      name: 'School Name',
      timeZone: TimeZone.create('Europe/Moscow'),
      now: DateTime.now(),
    });

    const schoolRepository = orm.em.fork().getRepository(School);
    await schoolRepository.persistAndFlush(school);
  });

  beforeEach(async () => {
    const id = GroupId.create();
    group = Group.create({
      id,
      name: 'Group Name',
      school: school,
      now: DateTime.now(),
    });

    const groupRepository = orm.em.fork().getRepository(Group);
    await groupRepository.persistAndFlush(group);
  });

  it('should create a subject with weekly periodicity', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-22T12:48:38.529Z'));

    const knex = orm.em.getConnection().getKnex();

    const result = await subjectsService.create(group.schoolId.value, {
      name: 'Test Subject',
      recurrence: new WeeklyRecurrenceDto({
        days: [0, 2, 3],
      }),
      time: new TimeIntervalDto({ startsAt: 0, duration: 120 }),
      groupId: group.id.value,
      requiredTeachers: 3,
    });

    const result2 = await subjectsService.findOne(result.id);
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

  afterAll(async () => {
    await orm.close();
  });
});