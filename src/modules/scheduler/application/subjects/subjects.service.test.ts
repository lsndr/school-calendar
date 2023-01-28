import { SubjectsService } from './subjects.service';
import { Test } from '@nestjs/testing';
import {
  knexProvider,
  uowProvider,
  KNEX_PROVIDER,
  UOW_PROVIDER,
} from '../../../shared/database';
import { Knex } from 'knex';
import { recreateDb } from '../../../../../test-utils';
import { TimeIntervalDto } from './time-interval.dto';
import { Group, GroupId, School, SchoolId, TimeZone } from '../../domain';
import { Uow } from 'yuow';
import { GroupRepository, SchoolRepository } from '../../database';
import { WeeklyPeriodicityDto } from './weekly-periodicity.dto';
import { DateTime } from 'luxon';

describe('Teachers Service', () => {
  let subjectsService: SubjectsService;
  let school: School;
  let group: Group;
  let knex: Knex;
  let uow: Uow;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [SubjectsService, knexProvider, uowProvider],
    }).compile();

    subjectsService = moduleRef.get(SubjectsService);
    knex = moduleRef.get(KNEX_PROVIDER);
    uow = moduleRef.get(UOW_PROVIDER);
  });

  beforeEach(async () => {
    await recreateDb(knex);
  });

  beforeEach(async () => {
    const id = SchoolId.create();

    school = School.create({
      id,
      name: 'School Name',
      timeZone: TimeZone.create('Europe/Moscow'),
      now: DateTime.now(),
    });

    await uow((ctx) => {
      const schoolRepository = ctx.getRepository(SchoolRepository);
      schoolRepository.add(school);
    });
  });

  beforeEach(async () => {
    const id = GroupId.create();
    group = Group.create({
      id,
      name: 'Group Name',
      school: school,
      now: DateTime.now(),
    });

    await uow((ctx) => {
      const groupRepository = ctx.getRepository(GroupRepository);
      groupRepository.add(group);
    });
  });

  it('should create a subject with weekly periodicity', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-22T12:48:38.529Z'));

    const result = await subjectsService.create(group.schoolId.value, {
      name: 'Test Subject',
      periodicity: new WeeklyPeriodicityDto({
        days: [0, 2, 3],
      }),
      time: new TimeIntervalDto({ startsAt: 0, duration: 120 }),
      groupId: group.id.value,
      requiredTeachers: 3,
    });

    const result2 = await subjectsService.findOne(result.id);
    const logs = await knex.select('*').from('subjects_log');

    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test Subject',
      periodicity: expect.objectContaining({
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
      periodicity: expect.objectContaining({
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
        periodicity_type: 'weekly',
        periodicity_data: {
          type: 'weekly',
          days: [0, 2, 3],
        },
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
        periodicity: new WeeklyPeriodicityDto({
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
    await knex.destroy();
  });
});
