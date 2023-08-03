import { Test } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '@shared/tests';
import { CommandBus, QueryBus, CqrsModule } from '@shared/cqrs';
import {
  CreateSubjectCommand,
  CreateSubjectCommandHandler,
} from './create-subject.command';
import {
  FindSubjectQuery,
  FindSubjectQueryHandler,
} from '../queries/find-subject.query';
import { Group, GroupId, School, SchoolId, TimeZone } from '../../../domain';
import { DateTime } from 'luxon';
import { WeeklyRecurrenceDto } from '../dtos/weekly-recurrence.dto';
import { CreateSubjectDto } from '../dtos/create-subject.dto';
import { TimeIntervalDto } from '../../shared';

describe('CreateSubjectCommand', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateSubjectCommandHandler,
        FindSubjectQueryHandler,
        testMikroormProvider,
      ],
    }).compile();

    commandBus = moduleRef.get(CommandBus);
    queryBus = moduleRef.get(QueryBus);
    orm = moduleRef.get(MikroORM);

    await moduleRef.createNestApplication().init();
  });

  it('should create a subject with weekly recurrence', async () => {
    // arrange
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-22T12:48:38.529Z'));

    const school = await seedSchool(orm);
    const group = await seedGroup(school, orm);
    const knex = orm.em.getConnection().getKnex();

    // act
    const result = await commandBus.execute(
      new CreateSubjectCommand({
        schoolId: group.schoolId.value,
        payload: new CreateSubjectDto({
          name: 'Test Subject',
          recurrence: new WeeklyRecurrenceDto({
            days: [0, 2, 3],
          }),
          time: new TimeIntervalDto({ startsAt: 0, duration: 120 }),
          groupId: group.id.value,
          requiredTeachers: 3,
        }),
      }),
    );

    const result2 = await queryBus.execute(
      new FindSubjectQuery({ schoolId: school.id.value, id: result.id }),
    );
    const logs = await knex.select('*').from('subject_log');

    // assert
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
    // arrange
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-22T12:48:38.529Z'));

    const school = await seedSchool(orm);
    const group = await seedGroup(school, orm);

    // act
    const act = () =>
      commandBus.execute(
        new CreateSubjectCommand({
          schoolId: 'wrong school id',
          payload: {
            name: 'Test Subject',
            recurrence: new WeeklyRecurrenceDto({
              days: [0, 2, 3],
            }),
            time: new TimeIntervalDto({ startsAt: 0, duration: 120 }),
            groupId: group.id.value,
            requiredTeachers: 3,
          },
        }),
      );

    // assert
    await expect(act).rejects.toThrowError('School not found');

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
