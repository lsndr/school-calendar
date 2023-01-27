import { LessonsService } from './lessons.service';
import { Test } from '@nestjs/testing';
import {
  knexProvider,
  uowProvider,
  KNEX_PROVIDER,
  UOW_PROVIDER,
} from '../../../shared/database';
import { Knex } from 'knex';
import { recreateDb } from '../../../../../test-utils';
import {
  Group,
  GroupId,
  Teacher,
  TeacherId,
  School,
  SchoolId,
  RequiredTeachers,
  TimeInterval,
  TimeZone,
  Subject,
  SubjectId,
  WeeklyPeriodicity,
} from '../../domain';
import { DateTime } from 'luxon';
import { Uow } from 'yuow';
import {
  GroupRepository,
  TeacherRepository,
  SchoolRepository,
  SubjectRepository,
} from '../../database';

describe('Lessons Service', () => {
  let lessonsService: LessonsService;
  let school: School;
  let subject: Subject;
  let group: Group;
  let knex: Knex;
  let uow: Uow;
  let teacher: Teacher;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [LessonsService, knexProvider, uowProvider],
    }).compile();

    lessonsService = moduleRef.get(LessonsService);
    knex = moduleRef.get(KNEX_PROVIDER);
    uow = moduleRef.get(UOW_PROVIDER);
  });

  beforeEach(async () => {
    await recreateDb(knex);
  });

  beforeEach(async () => {
    school = School.create({
      id: SchoolId.create(),
      name: 'Test School',
      timeZone: TimeZone.create('Europe/Moscow'),
      now: DateTime.now(),
    });

    await uow(async (ctx) => {
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

  beforeEach(async () => {
    subject = Subject.create({
      id: SubjectId.create(),
      name: 'Test School',
      school,
      group,
      periodicity: WeeklyPeriodicity.create([1, 2, 4]),
      timeInterval: TimeInterval.create({
        startsAt: 120,
        duration: 60,
      }),
      requiredTeachers: RequiredTeachers.create(3),
      now: DateTime.now(),
    });

    await uow(async (ctx) => {
      const subjectRepository = ctx.getRepository(SubjectRepository);
      subjectRepository.add(subject);
    });
  });

  beforeEach(async () => {
    teacher = Teacher.create({
      id: TeacherId.create(),
      name: 'Test School',
      school,
      now: DateTime.now(),
    });

    await uow(async (ctx) => {
      const teacherRepository = ctx.getRepository(TeacherRepository);
      teacherRepository.add(teacher);
    });
  });

  it('should create an lesson', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-23T14:00:28.460Z'));

    const result = await lessonsService.create(
      school.id.value,
      subject.id.value,
      {
        date: '2023-01-24',
        teacherIds: [teacher.id.value],
        timeInterval: {
          startsAt: 45,
          duration: 123,
        },
      },
    );

    const result2 = await lessonsService.findOne(
      school.id.value,
      subject.id.value,
      '2023-01-24',
    );

    expect(result2).toEqual({
      date: '2023-01-24',
      subjectId: subject.id.value,
      createdAt: '2023-01-23T14:00:28.460+00:00',
      updatedAt: '2023-01-23T14:00:28.460+00:00',
      teacherIds: [teacher.id.value],
      timeInterval: expect.objectContaining({
        duration: 123,
        startsAt: 45,
      }),
    });
    expect(result).toEqual({
      date: '2023-01-24',
      subjectId: subject.id.value,
      createdAt: '2023-01-23T14:00:28.460+00:00',
      updatedAt: '2023-01-23T14:00:28.460+00:00',
      teacherIds: [teacher.id.value],
      timeInterval: expect.objectContaining({
        duration: 123,
        startsAt: 45,
      }),
    });

    jest.useRealTimers();
  });

  afterAll(async () => {
    await knex.destroy();
  });
});
