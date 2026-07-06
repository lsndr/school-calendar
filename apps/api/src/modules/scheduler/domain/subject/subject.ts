import { Entity } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { Recurrence } from './recurrence';
import { ExactDate, TimeInterval } from '../shared';
import { Group, GroupId } from './../group';
import { School, SchoolId } from './../school';
import { RequiredTeachers } from './required-teachers';
import { SubjectId } from './subject-id';
import { SubjectState } from './subject.state';
import { extractDatesFromRecurrence } from './helpers';

export interface CreateSubject {
  id: SubjectId;
  name: string;
  school: School;
  recurrence: Recurrence;
  time: TimeInterval;
  group: Group;
  requiredTeachers: RequiredTeachers;
  now: DateTime;
}

@Entity()
export class Subject extends SubjectState {
  public get id(): SubjectId {
    return this._id;
  }

  public get schoolId(): SchoolId {
    return this._schoolId;
  }

  public get name(): string {
    return this._name;
  }

  public get recurrence(): Recurrence {
    return this._recurrence;
  }

  public get groupId(): GroupId {
    return this._groupId;
  }

  public get requiredTeachers(): RequiredTeachers {
    return this._requiredTeachers;
  }

  public get time(): TimeInterval {
    return this._time;
  }

  public get createdAt(): DateTime {
    return this._createdAt;
  }

  public get updatedAt(): DateTime {
    return this._updatedAt;
  }

  public static create(data: CreateSubject): Subject {
    this.assert(
      data.school.id.value === data.group.schoolId.value,
      'group_doesnt_belong_to_school',
    );

    const subject = new this({
      id: data.id,
      groupId: data.group.id,
      schoolId: data.school.id,
      name: data.name,
      requiredTeachers: data.requiredTeachers,
      recurrence: data.recurrence,
      time: data.time,
      createdAt: data.now,
      updatedAt: data.now,
    });

    return subject;
  }

  public setName(name: string, now: DateTime): void {
    this._name = name;
    this._updatedAt = now;
  }

  public setRecurrence(recurrence: Recurrence, now: DateTime): void {
    this._recurrence = recurrence;
    this._updatedAt = now;
  }

  public setTime(time: TimeInterval, now: DateTime): void {
    this._time = time;
    this._updatedAt = now;
  }

  public setRequiredTeachers(
    requiredTeachers: RequiredTeachers,
    now: DateTime,
  ): void {
    this._requiredTeachers = requiredTeachers;
    this._updatedAt = now;
  }

  public doesOccureOn(date: ExactDate, school: School): boolean {
    this.assert(this._schoolId.value === school.id.value, 'wrong_school');

    const dateTime = date.toDateTime(school.timeZone);

    const dates = extractDatesFromRecurrence(
      dateTime,
      dateTime.plus({ day: 1 }),
      {
        timeZone: school.timeZone.value,
        calculateSince: this._createdAt,
        recurrence: this.recurrence,
      },
    );

    return !!dates.next().value;
  }
}
