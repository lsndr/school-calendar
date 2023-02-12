import { Entity } from '@mikro-orm/core';
import * as assert from 'assert';
import { DateTime } from 'luxon';
import { Recurrence } from './recurrence';
import { ExactDate, TimeInterval } from '../shared';
import { Group } from './../group';
import { School } from './../school';
import { RequiredTeachers } from './required-teachers';
import { SubjectId } from './subject-id';
import { SubjectState } from './subject.state';
import { extractDatesFromPeriodicity } from './helpers';

export type CreateSubject = {
  id: SubjectId;
  name: string;
  school: School;
  recurrence: Recurrence;
  time: TimeInterval;
  group: Group;
  requiredTeachers: RequiredTeachers;
  now: DateTime;
};

@Entity()
export class Subject extends SubjectState {
  get id() {
    return this._id;
  }

  get schoolId() {
    return this._schoolId;
  }

  get name() {
    return this._name;
  }

  get recurrence() {
    return this._recurrence;
  }

  get groupId() {
    return this._groupId;
  }

  get requiredTeachers() {
    return this._requiredTeachers;
  }

  get time() {
    return this._time;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  static create(data: CreateSubject) {
    assert.ok(
      data.school.id.value === data.group.schoolId.value,
      'School id and group school id must match',
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

  setName(name: string, now: DateTime) {
    this._name = name;
    this._updatedAt = now;
  }

  setRecurrence(recurrence: Recurrence, now: DateTime) {
    this._recurrence = recurrence;
    this._updatedAt = now;
  }

  setTime(time: TimeInterval, now: DateTime) {
    this._time = time;
    this._updatedAt = now;
  }

  setRequiredTeachers(requiredTeachers: RequiredTeachers, now: DateTime) {
    this._requiredTeachers = requiredTeachers;
    this._updatedAt = now;
  }

  doesOccureOn(date: ExactDate, school: School): boolean {
    assert.ok(
      this._schoolId.value === school.id.value,
      'Wrong school provided',
    );

    const dateTime = date.toDateTime(school.timeZone);

    const dates = extractDatesFromPeriodicity(
      dateTime,
      dateTime.plus({ day: 1 }),
      {
        timeZone: school.timeZone.value,
        calculateSince: this._createdAt,
        recurence: this.recurrence,
      },
    );

    return !!dates.next().value;
  }
}
