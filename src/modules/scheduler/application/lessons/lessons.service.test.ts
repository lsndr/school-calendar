import { LessonsService } from './lessons.service';
import { Test } from '@nestjs/testing';
import { MIKROORM_PROVIDER } from '../../../shared/database';
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
  WeeklyRecurrence,
} from '../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '../../../../../test-utils';

describe('Lessons Service', () => {
  let lessonsService: LessonsService;
  let school: School;
  let subject: Subject;
  let group: Group;
  let teacher: Teacher;
  let orm: MikroORM;

  beforeAll(async () => {
    jest.setTimeout(999999999999);
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [LessonsService, testMikroormProvider],
    }).compile();

    lessonsService = moduleRef.get(LessonsService);
    orm = moduleRef.get(MIKROORM_PROVIDER);
  });

  beforeEach(async () => {
    school = School.create({
      id: SchoolId.create(),
      name: 'Test School',
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

  beforeEach(async () => {
    subject = Subject.create({
      id: SubjectId.create(),
      name: 'Test School',
      school,
      group,
      recurrence: WeeklyRecurrence.create([1, 2, 4]),
      time: TimeInterval.create({
        startsAt: 120,
        duration: 60,
      }),
      requiredTeachers: RequiredTeachers.create(3),
      now: DateTime.now(),
    });

    const subjectRepository = orm.em.fork().getRepository(Subject);
    await subjectRepository.persistAndFlush(subject);
  });

  beforeEach(async () => {
    teacher = Teacher.create({
      id: TeacherId.create(),
      name: 'Test School',
      school,
      now: DateTime.now(),
    });

    const teacherRepository = orm.em.fork().getRepository(Teacher);
    await teacherRepository.persistAndFlush(teacher);
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
        time: {
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
      assignedTeachers: [
        {
          assignedAt: '2023-01-23T14:00:28.460+00:00',
          teacherId: teacher.id.value,
        },
      ],
      time: expect.objectContaining({
        duration: 123,
        startsAt: 45,
      }),
    });
    expect(result).toEqual({
      date: '2023-01-24',
      subjectId: subject.id.value,
      createdAt: '2023-01-23T14:00:28.460+00:00',
      updatedAt: '2023-01-23T14:00:28.460+00:00',
      assignedTeachers: [
        {
          assignedAt: '2023-01-23T14:00:28.460+00:00',
          teacherId: teacher.id.value,
        },
      ],
      time: expect.objectContaining({
        duration: 123,
        startsAt: 45,
      }),
    });

    jest.useRealTimers();
  });

  afterAll(async () => {
    await orm.close();
  });
});