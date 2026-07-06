import { Entity } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AggregateEvents } from '../../../shared/domain';
import { Teacher } from '../teacher';
import { School, SchoolId } from '../school';
import { ExactDate, TimeInterval } from '../shared';
import { Subject, SubjectId } from '../subject';
import { AssignedTeacher } from './assigned-teacher';
import { AssignedTeacherId } from './assigned-teacher-id';
import { LessonCreatedEvent } from './lesson-created.event';
import { LessonId } from './lesson-id';
import { LessonUpdatedEvent } from './lesson-updated.event';
import { LessonState } from './lesson.state';

export interface CreateLesson {
  id: LessonId;
  subject: Subject;
  date: ExactDate;
  time: TimeInterval;
  school: School;
  now: DateTime;
}

@Entity({ tableName: 'lesson' })
export class Lesson extends LessonState {
  public get subjectId(): SubjectId {
    return this._subjectId;
  }

  public get date(): ExactDate {
    return this._date;
  }

  public get time(): TimeInterval {
    return this._time;
  }

  public get assignedTeachers(): readonly Readonly<
    Omit<AssignedTeacher, 'lesson'>
  >[] {
    return this._assignedTeachers.getItems();
  }

  public get schoolId(): SchoolId {
    return this._schoolId;
  }

  public get updatedAt(): DateTime {
    return this._updatedAt;
  }

  public get createdAt(): DateTime {
    return this._createdAt;
  }

  public static create(data: CreateLesson): Lesson {
    this.assertNotInPast(data.date, data.time, data.school, data.now);
    this.assert(
      data.subject.doesOccureOn(data.date, data.school),
      'date_not_in_subject_recurrence',
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

  protected static assertNotInPast(
    date: ExactDate,
    time: TimeInterval,
    school: School,
    now: DateTime,
  ): void {
    const startsAt = date
      .toDateTime(school.timeZone)
      .plus({ minutes: time.startsAt });

    this.assert(
      now.toMillis() < startsAt.toMillis(),
      'lesson_in_past_can_not_be_edited',
    );
  }

  public assignTeacher(
    teacher: Teacher,
    subject: Subject,
    school: School,
    now: DateTime,
  ): void {
    if (this.isTeacherAssigned(teacher.id.value)) {
      return;
    }

    this.assert(
      subject.schoolId.value === this.schoolId.value,
      'subject_has_wrong_school',
    );
    this.assert(
      this._assignedTeachers.length + 1 <= subject.requiredTeachers.value,
      'too_many_teachers_assigned',
    );
    this.assertLessonNotInPast(school, now);
    this.assert(
      teacher.schoolId.value === this.schoolId.value,
      'teacher_has_wrong_school',
    );
    this.assert(school.id.value === this.schoolId.value, 'wrong_school');

    const assignedTeacher = new AssignedTeacher({
      id: AssignedTeacherId.create(),
      assignedAt: now,
      teacherId: teacher.id,
    });

    this._assignedTeachers.add(assignedTeacher);
    this._updatedAt = now;
    this.addOrReplaceUpdatedEvent();
  }

  public unassignTeacher(
    teacherId: string,
    school: School,
    now: DateTime,
  ): void {
    this.assertLessonNotInPast(school, now);
    this.assert(school.id.value === this.schoolId.value, 'wrong_school');

    for (const teacher of this._assignedTeachers) {
      if (teacher.teacherId.value === teacherId) {
        this._assignedTeachers.remove(teacher);
      }
    }

    this._updatedAt = now;
    this.addOrReplaceUpdatedEvent();
  }

  public isTeacherAssigned(teacherId: string): boolean {
    for (const teacher of this._assignedTeachers) {
      if (teacher.teacherId.value === teacherId) {
        return true;
      }
    }

    return false;
  }

  public setTime(time: TimeInterval, now: DateTime): void {
    this._time = time;
    this._updatedAt = now;

    this.addOrReplaceUpdatedEvent();
  }

  protected assertLessonNotInPast(school: School, now: DateTime): void {
    Lesson.assertNotInPast(this.date, this.time, school, now);
  }

  protected addOrReplaceUpdatedEvent(): void {
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
}
