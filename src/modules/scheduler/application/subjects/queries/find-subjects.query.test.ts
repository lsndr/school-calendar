import { Test } from '@nestjs/testing';
import { Group, GroupId, School, SchoolId, TimeZone } from '../../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '@shared/tests';
import { CommandBus, CqrsModule, QueryBus } from '@shared/cqrs';
import {
  FindSubjectsQuery,
  FindSubjectsQueryHandler,
} from './find-subjects.query';
import {
  CreateSubjectCommand,
  CreateSubjectCommandHandler,
} from '../commands/create-subject.command';
import { CreateSubjectDto } from '../dtos/create-subject.dto';
import { WeeklyRecurrenceDto } from '../dtos/weekly-recurrence.dto';
import { DailyRecurrenceDto } from '../dtos/daily-recurrence.dto';
import { MonthlyRecurrenceDto } from '../dtos/monthly-recurrence.dto';
import { TimeIntervalDto } from '../../shared';

describe('FindSubjectsQuery', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        FindSubjectsQueryHandler,
        CreateSubjectCommandHandler,
        testMikroormProvider,
      ],
    }).compile();

    queryBus = moduleRef.get(QueryBus);
    commandBus = moduleRef.get(CommandBus);
    orm = moduleRef.get(MikroORM);

    await moduleRef.createNestApplication().init();
  });

  it('should find schools', async () => {
    // arrange
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-22T12:48:38.529Z'));

    const school1 = await seedSchool(orm);
    const school2 = await seedSchool(orm);
    const group1 = await seedGroup(school1, orm);
    const group2 = await seedGroup(school1, orm);
    const group3 = await seedGroup(school2, orm);

    await commandBus.execute(
      new CreateSubjectCommand({
        schoolId: group1.schoolId.value,
        payload: new CreateSubjectDto({
          name: 'Test Subject 1',
          recurrence: new WeeklyRecurrenceDto({
            days: [0, 2, 3],
          }),
          time: new TimeIntervalDto({ startsAt: 0, duration: 120 }),
          groupId: group1.id.value,
          requiredTeachers: 3,
        }),
      }),
    );

    await commandBus.execute(
      new CreateSubjectCommand({
        schoolId: group2.schoolId.value,
        payload: new CreateSubjectDto({
          name: 'Test Subject 2',
          recurrence: new MonthlyRecurrenceDto({
            days: [0, 2, 3],
          }),
          time: new TimeIntervalDto({ startsAt: 630, duration: 240 }),
          groupId: group2.id.value,
          requiredTeachers: 2,
        }),
      }),
    );

    await commandBus.execute(
      new CreateSubjectCommand({
        schoolId: group3.schoolId.value,
        payload: new CreateSubjectDto({
          name: 'Test Subject 3',
          recurrence: new DailyRecurrenceDto(),
          time: new TimeIntervalDto({ startsAt: 400, duration: 200 }),
          groupId: group3.id.value,
          requiredTeachers: 2,
        }),
      }),
    );

    const result = await queryBus.execute(
      new FindSubjectsQuery({
        schoolId: school1.id.value,
      }),
    );

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
