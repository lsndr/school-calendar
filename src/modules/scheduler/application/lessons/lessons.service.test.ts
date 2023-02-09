import { LessonsService } from './lessons.service';
import { Test } from '@nestjs/testing';
import {
  Lesson,
  LessonId,
  Group,
  GroupId,
  Teacher,
  TeacherId,
  ExactDate,
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
import { CreateLessonDto } from './create-lesson.dto';
import { AssignTeachersDto } from './assign-teachers.dto';

describe('Lessons Service', () => {
  let lessonsService: LessonsService;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [LessonsService, testMikroormProvider],
    }).compile();

    lessonsService = moduleRef.get(LessonsService);
    orm = moduleRef.get(MikroORM);
  });

  it('should create an lesson', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-23T14:00:28.460Z'));
    const knex = orm.em.getConnection().getKnex();
    const school = await seedSchool(orm);
    const group = await seedGroup(school, orm);
    const subject = await seedSubject(school, group, orm);
    const teacher = await seedTeacher(school, orm);

    const result = await lessonsService.create(
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
    );

    const result2 = await lessonsService.findOne(
      school.id.value,
      subject.id.value,
      '2023-01-24',
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

  it('should assign an teacher to lesson', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-23T14:00:28.460Z'));
    const knex = orm.em.getConnection().getKnex();
    const school = await seedSchool(orm);
    const group = await seedGroup(school, orm);
    const subject = await seedSubject(school, group, orm);
    const teacher = await seedTeacher(school, orm);
    await seedLesson(
      {
        school,
        subject,
        date: ExactDate.create({
          year: 2023,
          month: 1,
          day: 28,
        }),
        time: TimeInterval.create({
          startsAt: 45,
          duration: 123,
        }),
      },
      orm,
    );

    jest.setSystemTime(new Date('2023-01-24T01:00:28.460Z'));

    const result = await lessonsService.assignTeachers(
      school.id.value,
      subject.id.value,
      '2023-01-28',
      new AssignTeachersDto({
        teacherIds: [teacher.id.value],
      }),
    );

    const result2 = await lessonsService.findOne(
      school.id.value,
      subject.id.value,
      '2023-01-28',
    );
    const outbox = await knex.select('*').from('outbox');

    expect(result).toEqual([
      {
        assignedAt: '2023-01-24T01:00:28.460+00:00',
        teacherId: teacher.id.value,
      },
    ]);
    expect(result2).toEqual({
      date: '2023-01-28',
      subjectId: subject.id.value,
      createdAt: '2023-01-23T14:00:28.460+00:00',
      updatedAt: '2023-01-24T01:00:28.460+00:00',
      assignedTeachers: [
        {
          assignedAt: '2023-01-24T01:00:28.460+00:00',
          teacherId: teacher.id.value,
        },
      ],
      time: expect.objectContaining({
        duration: 123,
        startsAt: 45,
      }),
    });
    expect(outbox).toEqual([
      {
        created_at: DateTime.fromISO('2023-01-24T01:00:28.460+00:00'),
        id: expect.any(String),
        payload: {
          createdAt: '2023-01-23T14:00:28.460+00:00',
          teacherIds: [teacher.id.value],
          id: {
            date: {
              day: 28,
              month: 1,
              year: 2023,
            },
            subjectId: subject.id.value,
          },
          time: {
            duration: 123,
            startsAt: 45,
          },
          updatedAt: '2023-01-24T01:00:28.460+00:00',
        },
        processed_at: null,
        topic: 'scheduler.LessonUpdatedEvent',
      },
    ]);

    jest.useRealTimers();
  });

  it('should unassign an teacher from lesson', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-23T14:00:28.460Z'));
    const knex = orm.em.getConnection().getKnex();
    const school = await seedSchool(orm);
    const group = await seedGroup(school, orm);
    const subject = await seedSubject(school, group, orm);
    const teacher = await seedTeacher(school, orm);
    await seedLesson(
      {
        school,
        subject,
        date: ExactDate.create({
          year: 2023,
          month: 1,
          day: 28,
        }),
        time: TimeInterval.create({
          startsAt: 45,
          duration: 123,
        }),
        assingTeacher: teacher,
      },
      orm,
    );
    await knex.delete().from('outbox');

    jest.setSystemTime(new Date('2023-01-24T01:00:28.460Z'));

    const result = await lessonsService.unassignTeachers(
      school.id.value,
      subject.id.value,
      '2023-01-28',
      new AssignTeachersDto({
        teacherIds: [teacher.id.value],
      }),
    );

    const result2 = await lessonsService.findOne(
      school.id.value,
      subject.id.value,
      '2023-01-28',
    );
    const outbox = await knex.select('*').from('outbox');

    expect(result).toEqual([]);
    expect(result2).toEqual({
      date: '2023-01-28',
      subjectId: subject.id.value,
      createdAt: '2023-01-23T14:00:28.460+00:00',
      updatedAt: '2023-01-24T01:00:28.460+00:00',
      assignedTeachers: [],
      time: expect.objectContaining({
        duration: 123,
        startsAt: 45,
      }),
    });
    expect(outbox).toEqual([
      {
        created_at: DateTime.fromISO('2023-01-24T01:00:28.460+00:00'),
        id: expect.any(String),
        payload: {
          createdAt: '2023-01-23T14:00:28.460+00:00',
          teacherIds: [],
          id: {
            date: {
              day: 28,
              month: 1,
              year: 2023,
            },
            subjectId: subject.id.value,
          },
          time: {
            duration: 123,
            startsAt: 45,
          },
          updatedAt: '2023-01-24T01:00:28.460+00:00',
        },
        processed_at: null,
        topic: 'scheduler.LessonUpdatedEvent',
      },
    ]);

    jest.useRealTimers();
  });

  afterEach(async () => {
    await orm.close();
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

async function seedLesson(
  data: {
    subject: Subject;
    school: School;
    date: ExactDate;
    time: TimeInterval;
    assingTeacher?: Teacher;
  },
  orm: MikroORM,
) {
  const id = LessonId.create();
  const lesson = Lesson.create({
    id,
    subject: data.subject,
    school: data.school,
    date: data.date,
    time: data.time,
    now: DateTime.now(),
  });

  if (data.assingTeacher) {
    lesson.assignTeacher(
      data.assingTeacher,
      data.subject,
      data.school,
      DateTime.now(),
    );
  }

  const lessonRepository = orm.em.fork().getRepository(Lesson);
  await lessonRepository.persistAndFlush(lesson);

  return lesson;
}
