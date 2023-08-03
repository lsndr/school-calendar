import { Test } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '@shared/tests';
import { CommandBus, QueryBus, CqrsModule } from '@shared/cqrs';
import {
  UpdateSubjectCommand,
  UpdateSubjectCommandHandler,
} from './update-subject.command';
import {
  FindSubjectQuery,
  FindSubjectQueryHandler,
} from '../queries/find-subject.query';
import { Group, GroupId, School, SchoolId, TimeZone } from '../../../domain';
import { DateTime } from 'luxon';
import { WeeklyRecurrenceDto } from '../dtos/weekly-recurrence.dto';
import { CreateSubjectDto } from '../dtos/create-subject.dto';
import {
  CreateSubjectCommand,
  CreateSubjectCommandHandler,
} from './create-subject.command';
import { UpdateSubjectDto } from '../dtos/update-subject.dto';
import { DailyRecurrenceDto } from '../dtos/daily-recurrence.dto';
import { TimeIntervalDto } from '../../shared';

describe('UpdateSubjectCommand', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateSubjectCommandHandler,
        UpdateSubjectCommandHandler,
        FindSubjectQueryHandler,
        testMikroormProvider,
      ],
    }).compile();

    commandBus = moduleRef.get(CommandBus);
    queryBus = moduleRef.get(QueryBus);
    orm = moduleRef.get(MikroORM);

    await moduleRef.createNestApplication().init();
  });

  it('should update subject', async () => {
    // arrange
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-22T12:48:38.529Z'));

    const knex = orm.em.getConnection().getKnex();
    const school = await seedSchool(orm);
    const group = await seedGroup(school, orm);
    const subject = await commandBus.execute(
      new CreateSubjectCommand({
        schoolId: group.schoolId.value,
        payload: new CreateSubjectDto({
          name: 'Old Name',
          recurrence: new WeeklyRecurrenceDto({
            days: [0, 2, 3],
          }),
          time: new TimeIntervalDto({ startsAt: 0, duration: 120 }),
          groupId: group.id.value,
          requiredTeachers: 3,
        }),
      }),
    );

    jest.setSystemTime(new Date('2023-01-23T15:12:45.529Z'));

    // act
    const result = await commandBus.execute(
      new UpdateSubjectCommand({
        schoolId: group.schoolId.value,
        id: subject.id,
        payload: new UpdateSubjectDto({
          name: 'New name',
          recurrence: new DailyRecurrenceDto(),
          time: new TimeIntervalDto({ startsAt: 600, duration: 200 }),
          requiredTeachers: 1,
        }),
      }),
    );

    // assert
    if (!result) {
      throw new Error('Not found');
    }

    const result2 = await queryBus.execute(
      new FindSubjectQuery({ schoolId: school.id.value, id: result.id }),
    );
    const logs = await knex.select('*').from('subject_log');

    expect(result).toEqual({
      id: subject.id,
      name: 'New name',
      recurrence: expect.objectContaining({
        type: 'daily',
      }),
      time: expect.objectContaining({
        startsAt: 600,
        duration: 200,
      }),
      requiredTeachers: 1,
      groupId: subject.groupId,
      createdAt: '2023-01-22T12:48:38.529+00:00',
      updatedAt: '2023-01-23T15:12:45.529+00:00',
    });
    expect(result2).toEqual(result);
    expect(logs).toEqual([
      {
        subject_id: result.id,
        name: 'Old Name',
        recurrence_type: 'weekly',
        recurrence_days: [0, 2, 3],
        recurrence_week1: null,
        recurrence_week2: null,
        time_starts_at: 0,
        time_duration: 120,
        required_teachers: 3,
        created_at: DateTime.fromISO('2023-01-22T12:48:38.529Z'),
      },
      {
        subject_id: result.id,
        name: 'New name',
        recurrence_type: 'daily',
        recurrence_days: null,
        recurrence_week1: null,
        recurrence_week2: null,
        time_starts_at: 600,
        time_duration: 200,
        required_teachers: 1,
        created_at: DateTime.fromISO('2023-01-23T15:12:45.529Z'),
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
