import * as assert from 'assert';
import { DateTime } from 'luxon';
import {
  Aggregate,
  AggregateState,
  AggregateEvents,
} from '../../shared/domain';
import { LessonCreatedEvent } from './lesson-created.event';
import { LessonId } from './lesson-id';
import { LessonUpdatedEvent } from './lesson-updated.event';
import { Teacher } from './teacher';
import { TeacherId } from './teacher-id';
import { ExactDate } from './exact-date';
import { School } from './school';
import { SchoolId } from './school-id';
import { TimeInterval } from './time-interval';
import { Subject } from './subject';

export type CreateLesson = {
  id: LessonId;
  timeInterval: TimeInterval;
  school: School;
  now: DateTime;
};

export interface LessonState extends AggregateState<LessonId> {
  timeInterval: TimeInterval;
  schoolId: SchoolId;
  teacherIds: Map<string, TeacherId>;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export class Lesson extends Aggregate<LessonId, LessonState> {
  get timeInterval() {
    return this.state.timeInterval;
  }

  get teacherIds(): ReadonlyArray<TeacherId> {
    return Array.from(this.state.teacherIds.values());
  }

  get schoolId() {
    return this.state.schoolId;
  }

  get updatedAt() {
    return this.state.updatedAt;
  }

  get createdAt() {
    return this.state.createdAt;
  }

  static create(data: CreateLesson) {
    this.assertNotInPast(
      data.id.date,
      data.timeInterval,
      data.school,
      data.now,
    );

    const eventsManager = new AggregateEvents();
    const lesson = new this(
      {
        id: data.id,
        timeInterval: data.timeInterval,
        schoolId: data.school.id,
        teacherIds: new Map(),
        createdAt: data.now,
        updatedAt: data.now,
      },
      eventsManager,
    );

    eventsManager.add(
      new LessonCreatedEvent({
        id: {
          subjectId: lesson.id.subjectId.value,
          date: {
            day: lesson.id.date.day,
            month: lesson.id.date.month,
            year: lesson.id.date.year,
          },
        },
        timeInterval: lesson.timeInterval,
        teacherIds: Array.from(lesson.teacherIds).map((id) => id.value),
        createdAt: lesson.createdAt.toISO(),
        updatedAt: lesson.updatedAt.toISO(),
      }),
    );

    return lesson;
  }

  protected assertLessonNotInPast(school: School, now: DateTime) {
    Lesson.assertNotInPast(this.id.date, this.timeInterval, school, now);
  }

  assignTeacher(
    teacher: Teacher,
    subject: Subject,
    school: School,
    now: DateTime,
  ) {
    assert.ok(
      subject.schoolId.value === this.schoolId.value,
      "Subject must belong to the lesson's school",
    );
    assert.ok(
      this.state.teacherIds.size + 1 <= subject.requiredTeachers.amount,
      'Too many teachers assigned',
    );
    this.assertLessonNotInPast(school, now);
    assert.ok(
      teacher.schoolId.value === this.schoolId.value,
      "Teacher must belong to the lesson's school",
    );
    assert.ok(
      school.id.value === this.schoolId.value,
      "School must the same as the lesson's school",
    );

    this.state.teacherIds.set(teacher.id.value, teacher.id);
    this.state.updatedAt = now;

    this.addOrReplaceUpdatedEvent();
  }

  unassignTeacher(teacherId: string, school: School, now: DateTime) {
    this.assertLessonNotInPast(school, now);
    assert.ok(
      school.id.value === this.schoolId.value,
      "School must the same as the lesson's school",
    );

    this.state.teacherIds.delete(teacherId);
    this.state.updatedAt = now;

    this.addOrReplaceUpdatedEvent();
  }

  setTimeInterval(timeInterval: TimeInterval, now: DateTime) {
    this.state.timeInterval = timeInterval;
    this.state.updatedAt = now;

    this.addOrReplaceUpdatedEvent();
  }

  protected addOrReplaceUpdatedEvent() {
    const event = new LessonUpdatedEvent({
      id: {
        subjectId: this.id.subjectId.value,
        date: {
          day: this.id.date.day,
          month: this.id.date.month,
          year: this.id.date.year,
        },
      },
      timeInterval: this.timeInterval,
      teacherIds: Array.from(this.teacherIds).map((id) => id.value),
      createdAt: this.createdAt.toISO(),
      updatedAt: this.updatedAt.toISO(),
    });

    this.eventsManager.replaceInstanceOrAdd(LessonUpdatedEvent, event);
  }

  protected static assertNotInPast(
    date: ExactDate,
    timeInterval: TimeInterval,
    school: School,
    now: DateTime,
  ) {
    const startsAt = date
      .toDateTime(school.timeZone)
      .plus({ minutes: timeInterval.startsAt });

    assert.ok(
      now.toMillis() < startsAt.toMillis(),
      'Lesson in past can not be modified or created',
    );
  }
}
