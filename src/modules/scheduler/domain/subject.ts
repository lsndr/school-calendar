import { Embedded, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import * as assert from 'assert';
import { DateTime } from 'luxon';
import { AggregateState } from '../../shared/domain';
import { GroupIdType, SchoolIdType } from '../database';
import { SubjectIdType, RequiredTeachersType } from '../database/subject';
import { Group } from './group';
import { GroupId } from './group-id';
import { School } from './school';
import { SchoolId } from './school-id';
import {
  BiWeeklyRecurrence,
  DailyRecurrence,
  MonthlyRecurrence,
  WeeklyRecurrence,
} from './recurrence';

import { RequiredTeachers } from './required-teachers';
import { TimeInterval } from './time-interval';
import { SubjectId } from './subject-id';

type Recurrence =
  | DailyRecurrence
  | WeeklyRecurrence
  | BiWeeklyRecurrence
  | MonthlyRecurrence;

abstract class SubjectState extends AggregateState {
  @PrimaryKey({ name: 'id', type: SubjectIdType })
  protected _id!: SubjectId;

  @Property({ name: 'name' })
  protected _name!: string;

  @Property({ name: 'school_id', type: SchoolIdType })
  protected _schoolId!: SchoolId;

  @Embedded(
    () => [
      DailyRecurrence,
      WeeklyRecurrence,
      BiWeeklyRecurrence,
      MonthlyRecurrence,
    ],
    { prefix: 'recurrence_' },
  )
  protected _recurrence!: Recurrence;

  @Embedded(() => TimeInterval, { prefix: 'time_' })
  protected _time!: TimeInterval;

  @Property({ name: 'group_id', type: GroupIdType })
  protected _groupId!: GroupId;

  @Property({ name: 'required_teachers', type: RequiredTeachersType })
  protected _requiredTeachers!: RequiredTeachers;

  @Property({ name: 'created_at' })
  protected _createdAt!: DateTime;

  @Property({ name: 'updated_at' })
  protected _updatedAt!: DateTime;

  @Property({ name: 'version', version: true })
  protected _version!: number;
}

type CreateSubject = {
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

    const subject = new this();

    subject._id = data.id;
    subject._groupId = data.group.id;
    subject._schoolId = data.school.id;
    subject._name = data.name;
    subject._requiredTeachers = data.requiredTeachers;
    subject._recurrence = data.recurrence;
    subject._time = data.time;
    subject._createdAt = data.now;
    subject._updatedAt = data.now;

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
}