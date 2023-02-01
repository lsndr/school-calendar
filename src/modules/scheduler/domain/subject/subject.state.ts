import { Embedded, PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AggregateState } from '../../../shared/domain';
import {
  GroupIdType,
  SchoolIdType,
  SubjectIdType,
  RequiredTeachersType,
} from '../../database';
import {
  BiWeeklyRecurrence,
  DailyRecurrence,
  MonthlyRecurrence,
  Recurrence,
  WeeklyRecurrence,
} from './recurrence';
import { TimeInterval } from '../shared';
import { GroupId } from './../group';
import { SchoolId } from './../school';
import { RequiredTeachers } from './required-teachers';

import { SubjectId } from './subject-id';

type CreateSubjectState = {
  id: SubjectId;
  name: string;
  schoolId: SchoolId;
  recurrence: Recurrence;
  time: TimeInterval;
  groupId: GroupId;
  requiredTeachers: RequiredTeachers;
  createdAt: DateTime;
  updatedAt: DateTime;
};

export abstract class SubjectState extends AggregateState {
  @PrimaryKey({ name: 'id', type: SubjectIdType })
  protected _id: SubjectId;

  @Property({ name: 'name' })
  protected _name: string;

  @Property({ name: 'school_id', type: SchoolIdType })
  protected _schoolId: SchoolId;

  @Embedded(
    () => [
      DailyRecurrence,
      WeeklyRecurrence,
      BiWeeklyRecurrence,
      MonthlyRecurrence,
    ],
    { prefix: 'recurrence_' },
  )
  protected _recurrence: Recurrence;

  @Embedded(() => TimeInterval, { prefix: 'time_' })
  protected _time: TimeInterval;

  @Property({ name: 'group_id', type: GroupIdType })
  protected _groupId: GroupId;

  @Property({ name: 'required_teachers', type: RequiredTeachersType })
  protected _requiredTeachers: RequiredTeachers;

  @Property({ name: 'created_at' })
  protected _createdAt: DateTime;

  @Property({ name: 'updated_at' })
  protected _updatedAt: DateTime;

  @Property({ name: 'version', version: true })
  protected _version: number;

  protected constructor(state: CreateSubjectState) {
    super();

    this._id = state.id;
    this._name = state.name;
    this._schoolId = state.schoolId;
    this._recurrence = state.recurrence;
    this._time = state.time;
    this._groupId = state.groupId;
    this._requiredTeachers = state.requiredTeachers;
    this._createdAt = state.createdAt;
    this._updatedAt = state.updatedAt;
    this._version = 1;
  }
}
