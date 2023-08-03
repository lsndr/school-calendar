import { Test } from '@nestjs/testing';
import {
  Group,
  GroupId,
  RequiredTeachers,
  School,
  SchoolId,
  Subject,
  SubjectId,
  TimeZone,
  WeeklyRecurrence,
  TimeInterval,
  Teacher,
  TeacherId,
} from '../../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '@shared/tests';
import { CqrsModule, CommandBus, QueryBus } from '@shared/cqrs';
import {
  CreateLessonCommand,
  CreateLessonCommandHandler,
} from './create-lesson.command';
import { CreateLessonDto } from '../dtos/create-lesson.dto';
import {
  FindLessonQuery,
  FindLessonQueryHandler,
} from '../queries/find-lesson.query';

describe('CreateLessonCommand', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateLessonCommandHandler,
        FindLessonQueryHandler,
        testMikroormProvider,
      ],
    }).compile();

    commandBus = moduleRef.get(CommandBus);
    queryBus = moduleRef.get(QueryBus);
    orm = moduleRef.get(MikroORM);

    await moduleRef.createNestApplication().init();
  });

  afterEach(async () => {
    await orm.close();
  });

  it('should create a lesson', async () => {
    // arrange
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-23T14:00:28.460Z'));
    const knex = orm.em.getConnection().getKnex();
    const school = await seedSchool(orm);
    const group = await seedGroup(school, orm);
    const subject = await seedSubject(school, group, orm);
    const teacher = await seedTeacher(school, orm);

    // act
    const result = await commandBus.execute(
      new CreateLessonCommand(
        school.id.value,
        subject.id.value,
        new CreateLessonDto({
          date: '2023-01-24',
          teacherIds: [teacher.id.value],
          time: {
            startsAt: 45,
            duration: 123,
          },
        }),
      ),
    );

    // assert
    const result2 = await queryBus.execute(
      new FindLessonQuery({
        schoolId: school.id.value,
        subjectId: subject.id.value,
        date: '2023-01-24',
      }),
    );
    const result3 = await knex.select('*').from('outbox');

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
    expect(result3).toEqual([
      {
        created_at: DateTime.fromISO('2023-01-23T14:00:28.460+00:00'),
        id: expect.any(String),
        payload: {
          createdAt: '2023-01-23T14:00:28.460+00:00',
          teacherIds: [teacher.id.value],
          id: {
            date: {
              day: 24,
              month: 1,
              year: 2023,
            },
            subjectId: subject.id.value,
          },
          time: {
            duration: 123,
            startsAt: 45,
          },
          updatedAt: '2023-01-23T14:00:28.460+00:00',
        },
        processed_at: null,
        topic: 'scheduler.LessonUpdatedEvent',
      },
    ]);

    jest.useRealTimers();
  });
});

async function seedSchool(orm: MikroORM) {
  const school = School.create({
    id: SchoolId.create(),
    name: 'Test School',
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

async function seedSubject(school: School, group: Group, orm: MikroORM) {
  const subject = Subject.create({
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

  return subject;
}

async function seedTeacher(school: School, orm: MikroORM) {
  const teacher = Teacher.create({
    id: TeacherId.create(),
    name: 'Test School',
    school,
    now: DateTime.now(),
  });

  const teacherRepository = orm.em.fork().getRepository(Teacher);
  await teacherRepository.persistAndFlush(teacher);

  return teacher;
}
