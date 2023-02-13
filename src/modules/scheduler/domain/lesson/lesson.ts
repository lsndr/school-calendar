import { Entity } from '@mikro-orm/core';
import * as assert from 'assert';
import { DateTime } from 'luxon';
import { AggregateEvents } from '../../../shared/domain';
import { Teacher } from '../teacher';
import { School } from '../school';
import { ExactDate, TimeInterval } from '../shared';
import { Subject } from '../subject';
// eslint-disable-next-line import/no-cycle -- Required by MikroORM
import { AssignedTeacher } from './assigned-teacher';
import { AssignedTeacherId } from './assigned-teacher-id';
import { LessonCreatedEvent } from './lesson-created.event';
import { LessonId } from './lesson-id';
import { LessonUpdatedEvent } from './lesson-updated.event';
import { LessonState } from './lesson.state';

export type CreateLesson = {
  id: LessonId;
  subject: Subject;
  date: ExactDate;
  time: TimeInterval;
  school: School;
  now: DateTime;
};

@Entity({ tableName: 'lesson' })
export class Lesson extends LessonState {
  get subjectId() {
    return this._subjectId;
  }

  get date() {
    return this._date;
  }

  get time() {
    return this._time;
  }

  get assignedTeachers(): ReadonlyArray<
    Readonly<Omit<AssignedTeacher, 'lesson'>>
  > {
    return this._assignedTeachers.getItems();
  }

  get schoolId() {
    return this._schoolId;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  get createdAt() {
    return this._createdAt;
  }

  static create(data: CreateLesson) {
    this.assertNotInPast(data.date, data.time, data.school, data.now);
    assert.ok(
      data.subject.doesOccureOn(data.date, data.school),
      'Date is not in subject recurrence',
    );

    const eventsManager = new AggregateEvents();
    const lesson = new this({
      id: data.id,
      subjectId: data.subject.id,
      time: data.time,
      date: data.date,
      schoolId: data.school.id,
      createdAt: data.now,
      updatedAt: data.now,
    });

    eventsManager.add(
      new LessonCreatedEvent({
        id: {
          subjectId: lesson.subjectId.value,
          date: {
            day: lesson.date.day,
            month: lesson.date.month,
            year: lesson.date.year,
          },
        },
        time: lesson.time,
        teacherIds: [],
        createdAt: lesson.createdAt.toISO(),
        updatedAt: lesson.updatedAt.toISO(),
      }),
    );

    return lesson;
  }

  protected assertLessonNotInPast(school: School, now: DateTime) {
    Lesson.assertNotInPast(this.date, this.time, school, now);
  }

  assignTeacher(
    teacher: Teacher,
    subject: Subject,
    school: School,
    now: DateTime,
  ) {
    if (this.isTeacherAssigned(teacher.id.value)) {
      return;
    }

    assert.ok(
      subject.schoolId.value === this.schoolId.value,
      "Subject must belong to the lesson's school",
    );
    assert.ok(
      this._assignedTeachers.length + 1 <= subject.requiredTeachers.value,
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

    const assignedTeacher = new AssignedTeacher({
      id: AssignedTeacherId.create(),
      assignedAt: now,
      teacherId: teacher.id,
    });

    this._assignedTeachers.add(assignedTeacher);
    this._updatedAt = now;
    this.addOrReplaceUpdatedEvent();
  }

  unassignTeacher(teacherId: string, school: School, now: DateTime) {
    this.assertLessonNotInPast(school, now);
    assert.ok(
      school.id.value === this.schoolId.value,
      "School must the same as the lesson's school",
    );

    for (const teacher of this._assignedTeachers) {
      if (teacher.teacherId.value === teacherId) {
        this._assignedTeachers.remove(teacher);
      }
    }

    this._updatedAt = now;
    this.addOrReplaceUpdatedEvent();
  }

  isTeacherAssigned(teacherId: string) {
    for (const teacher of this._assignedTeachers) {
      if (teacher.teacherId.value === teacherId) {
        return true;
      }
    }

    return false;
  }

  setTime(time: TimeInterval, now: DateTime) {
    this._time = time;
    this._updatedAt = now;

    this.addOrReplaceUpdatedEvent();
  }

  protected addOrReplaceUpdatedEvent() {
    const event = new LessonUpdatedEvent({
      id: {
        subjectId: this._subjectId.value,
        date: {
          day: this._date.day,
          month: this._date.month,
          year: this._date.year,
        },
      },
      time: this.time,
      teacherIds: this._assignedTeachers
        .getItems()
        .map((teacher) => teacher.teacherId.value),
      createdAt: this.createdAt.toISO(),
      updatedAt: this.updatedAt.toISO(),
    });

    this._events.replaceInstanceOrAdd(LessonUpdatedEvent, event);
  }

  protected static assertNotInPast(
    date: ExactDate,
    time: TimeInterval,
    school: School,
    now: DateTime,
  ) {
    const startsAt = date
      .toDateTime(school.timeZone)
      .plus({ minutes: time.startsAt });

    assert.ok(
      now.toMillis() < startsAt.toMillis(),
      'Lesson in past can not be modified or created',
    );
  }
}
