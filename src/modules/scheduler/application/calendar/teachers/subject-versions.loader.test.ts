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
  Group,
  GroupId,
  DailyPeriodicity,
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
  GroupRepository,
  SchoolRepository,
  SubjectRepository,
} from '../../../database';
import { SubjectVersionsLoader } from './subject-versions.loader';

describe('SubjectVersionLoader', () => {
  let loader: SubjectVersionsLoader;
  let school: School;
  let knex: Knex;
  let uow: Uow;

  let subject1: Subject;
  let group: Group;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [SubjectVersionsLoader, knexProvider, uowProvider],
    }).compile();

    loader = moduleRef.get(SubjectVersionsLoader);
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
        time: TimeInterval.create({
          startsAt: 720,
          duration: 60,
        }),
        group,
        requiredTeachers: RequiredTeachers.create(2),
        now: now.minus({ days: 2 }),
      });

      const subject2 = Subject.create({
        id: SubjectId.create(),
        school,
        name: 'Subject 2',
        periodicity: WeeklyPeriodicity.create([0, 4]),
        time: TimeInterval.create({
          startsAt: 960,
          duration: 120,
        }),
        group,
        requiredTeachers: RequiredTeachers.create(1),
        now: now.minus({ weeks: 4 }),
      });

      schoolRepository.add(school);
      groupRepository.add(group);
      subjectRepository.add(subject1);
      subjectRepository.add(subject2);
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
      subject.setTime(
        TimeInterval.create({
          startsAt: 120,
          duration: 600,
        }),
        now,
      );
    });
  });

  it('should load subject 1 since subject 1 version 2 starts later', async () => {
    const subjects = await loader.load({
      schoolId: school.id.value,
      timeZone: 'Europe/Moscow',
      from: DateTime.fromISO('2023-01-25T00:00:00', {
        zone: 'Europe/Moscow',
      }),
      to: DateTime.fromISO('2023-01-26T00:00:00', {
        zone: 'Europe/Moscow',
      }),
    });

    expect(Array.from(subjects)).toEqual([
      {
        groupId: group.id.value,
        date: DateTime.fromISO('2023-01-25T00:00:00', {
          zone: 'Europe/Moscow',
        }),
        duration: 60,
        id: subject1.id.value,
        name: 'Subject 1',
        startsAt: 720,
        requiredTeachers: 2,
      },
    ]);
  });

  it.skip('should properly load week from 2023-01-23 to 2023-01-30T00:00:00', async () => {
    const subjects = await loader.load({
      schoolId: school.id.value,
      timeZone: 'Europe/Moscow',
      from: DateTime.fromISO('2023-01-23T00:00:00', {
        zone: 'Europe/Moscow',
      }),
      to: DateTime.fromISO('2023-01-30T00:00:00', {
        zone: 'Europe/Moscow',
      }),
    });

    expect(Array.from(subjects)).toEqual([]);
  });

  afterAll(async () => {
    await knex.destroy();
  });
});
