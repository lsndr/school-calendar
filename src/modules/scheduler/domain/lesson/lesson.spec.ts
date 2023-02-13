import { MikroORM } from '@mikro-orm/postgresql';
import { DateTime } from 'luxon';
import { DomainError } from '../../../shared/domain';
import { Group, GroupId } from '../group';
import { Teacher, TeacherId } from '../teacher';
import { School, SchoolId } from '../school';
import { ExactDate, TimeInterval, TimeZone } from '../shared';
import {
  RequiredTeachers,
  Subject,
  SubjectId,
  WeekDays,
  WeeklyRecurrence,
} from '../subject';
import { AssignedTeacher } from './assigned-teacher';
import { Lesson } from './lesson';
import { LessonId } from './lesson-id';

describe('Lesson', () => {
  let school: School;
  let school2: School;
  let subject: Subject;
  let subject2: Subject;
  let group: Group;
  let group2: Group;
  let teacher1: Teacher;
  let teacher2: Teacher;
  let teacher3: Teacher;
  let teacher4: Teacher;

  beforeAll(async () => {
    await MikroORM.init(
      {
        dbName: ':memory:',
        entities: [Lesson, AssignedTeacher],
      },
      false,
    );
  });

  beforeEach(() => {
    school = School.create({
      id: SchoolId.create(),
      name: 'Test School',
      timeZone: TimeZone.create('Europe/Moscow'),
      now: DateTime.now(),
    });

    school2 = School.create({
      id: SchoolId.create(),
      name: 'Test School 2',
      timeZone: TimeZone.create('Europe/Moscow'),
      now: DateTime.now(),
    });
  });

  beforeEach(() => {
    group = Group.create({
      id: GroupId.create(),
      name: 'Test Group',
      school: school,
      now: DateTime.now(),
    });

    group2 = Group.create({
      id: GroupId.create(),
      name: 'Test Group 2',
      school: school2,
      now: DateTime.now(),
    });
  });

  beforeEach(() => {
    const weekDays: (typeof WeekDays)[number][] = [1, 0];

    const recurrence = WeeklyRecurrence.create(weekDays);
    const time = TimeInterval.create({
      startsAt: 0,
      duration: 120,
    });
    const requiredTeachers = RequiredTeachers.create(2);

    subject = Subject.create({
      id: SubjectId.create(),
      group,
      school,
      recurrence,
      name: 'Test Subject',
      time,
      requiredTeachers,
      now: DateTime.fromISO('2023-01-20T00:00:00.000Z'),
    });

    subject2 = Subject.create({
      id: SubjectId.create(),
      group: group2,
      school: school2,
      recurrence,
      name: 'Test Subject',
      time,
      requiredTeachers,
      now: DateTime.fromISO('2023-01-20T00:00:00.000Z'),
    });
  });

  beforeEach(() => {
    const id1 = TeacherId.create();
    const id2 = TeacherId.create();
    const id3 = TeacherId.create();

    teacher1 = Teacher.create({
      id: id1,
      name: 'Teacher 1',
      now: DateTime.now(),
      school,
    });

    teacher2 = Teacher.create({
      id: id2,
      name: 'Teacher 2',
      now: DateTime.now(),
      school,
    });

    teacher3 = Teacher.create({
      id: id3,
      name: 'Teacher 3',
      now: DateTime.now(),
      school,
    });

    teacher4 = Teacher.create({
      id: id3,
      name: 'Teacher 4',
      now: DateTime.now(),
      school: school2,
    });
  });

  it("should fail to add an teacher if number of teachers exceeds number of subject's required teachers", () => {
    const id = LessonId.create();
    const now = DateTime.fromISO('2023-01-20T12:00:00.000Z');
    const date = ExactDate.create({
      day: 23,
      month: 1,
      year: 2023,
    });
    const time = TimeInterval.create({
      startsAt: 0,
      duration: 60,
    });
    const lesson = Lesson.create({
      id,
      subject,
      date,
      time,
      school,
      now,
    });

    lesson.assignTeacher(teacher1, subject, school, now);
    lesson.assignTeacher(teacher2, subject, school, now);

    const act = () => lesson.assignTeacher(teacher3, subject, school, now);

    expect(act).toThrow(
      new DomainError('Lesson1', 'too_many_teachers_assigned'),
    );
  });

  it('should fail to add an teacher if subject belong to another school', () => {
    const now = DateTime.fromISO('2023-01-20T12:00:00.000Z');
    const date = ExactDate.create({
      day: 24,
      month: 1,
      year: 2023,
    });
    const id = LessonId.create();
    const time = TimeInterval.create({
      startsAt: 0,
      duration: 60,
    });
    const lesson = Lesson.create({
      id,
      subject,
      date,
      time,
      school,
      now,
    });

    const act = () => lesson.assignTeacher(teacher3, subject2, school, now);

    expect(act).toThrowError(
      new DomainError('Lesson1', 'subject_has_wrong_school'),
    );
  });

  it('should fail to add an teacher school reference has different id', () => {
    const now = DateTime.fromISO('2023-01-20T12:00:00.000Z');
    const date = ExactDate.create({
      day: 23,
      month: 1,
      year: 2023,
    });
    const id = LessonId.create();
    const time = TimeInterval.create({
      startsAt: 0,
      duration: 60,
    });
    const lesson = Lesson.create({
      id,
      subject,
      date,
      time,
      school,
      now,
    });

    const act = () => lesson.assignTeacher(teacher3, subject, school2, now);

    expect(act).toThrowError(new DomainError('Lesson1', 'wrong_school'));
  });

  it('should fail to add an teacher if it belongs to another school', () => {
    const now = DateTime.fromISO('2023-01-20T12:00:00.000Z');
    const date = ExactDate.create({
      day: 24,
      month: 1,
      year: 2023,
    });
    const id = LessonId.create();
    const time = TimeInterval.create({
      startsAt: 0,
      duration: 60,
    });
    const lesson = Lesson.create({
      id,
      subject,
      date,
      time,
      school,
      now,
    });

    const act = () => lesson.assignTeacher(teacher4, subject, school, now);

    expect(act).toThrow(new DomainError('Lesson1', 'teacher_has_wrong_school'));
  });

  it('should fail to create an lesson in past', () => {
    const now = DateTime.fromISO('2023-01-20T12:00:00.000Z');
    const date = ExactDate.create({
      day: 20,
      month: 1,
      year: 2023,
    });
    const time = TimeInterval.create({
      startsAt: 0,
      duration: 60,
    });
    const id = LessonId.create();

    const act = () =>
      Lesson.create({
        id,
        subject,
        date,
        school,
        time,
        now,
      });

    expect(act).toThrowError(
      new DomainError('Lesson1', 'lesson_in_past_can_not_be_edited'),
    );
  });

  it('should fail to add an teacher to an lesson in past', () => {
    const nowInPast = DateTime.fromISO('2023-01-20T12:00:00.000Z');
    const nowInFuture = DateTime.fromISO('2023-01-25T12:00:00.000Z');
    const date = ExactDate.create({
      day: 23,
      month: 1,
      year: 2023,
    });
    const time = TimeInterval.create({
      startsAt: 0,
      duration: 60,
    });
    const id = LessonId.create();
    const lesson = Lesson.create({
      id,
      subject,
      date,
      school,
      time,
      now: nowInPast,
    });

    const act = () =>
      lesson.assignTeacher(teacher1, subject, school, nowInFuture);

    expect(act).toThrowError(
      new DomainError('Lesson1', 'lesson_in_past_can_not_be_edited'),
    );
  });

  it('should add an teacher', () => {
    const now = DateTime.fromISO('2023-01-20T12:00:00.000Z');
    const id = LessonId.create();
    const date = ExactDate.create({
      day: 23,
      month: 1,
      year: 2023,
    });
    const time = TimeInterval.create({
      startsAt: 0,
      duration: 60,
    });
    const lesson = Lesson.create({
      id,
      subject,
      date,
      school,
      time,
      now,
    });

    lesson.assignTeacher(teacher1, subject, school, now);

    expect(lesson.assignedTeachers.length).toBe(1);
    expect(lesson.assignedTeachers[0]?.assignedAt).toBe(now);
    expect(lesson.assignedTeachers[0]?.teacherId).toBe(teacher1.id);
  });
});
