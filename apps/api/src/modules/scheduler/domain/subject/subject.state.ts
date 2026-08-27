import { type DateTime } from 'luxon';
import { AggregateRoot } from '../../../shared/domain';
import {
  BiWeeklyRecurrence,
  DailyRecurrence,
  MonthlyRecurrence,
  type Recurrence,
  WeeklyRecurrence,
} from './recurrence';
import { type TimeInterval } from '../shared';
import { type GroupId } from './../group';
import { type SchoolId } from './../school';
import { type RequiredTeachers } from './required-teachers';
import { type SubjectId } from './subject-id';

export interface CreateSubjectState {
  id: SubjectId;
  name: string;
  schoolId: SchoolId;
  recurrence: Recurrence;
  time: TimeInterval;
  groupId: GroupId;
  requiredTeachers: RequiredTeachers;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export abstract class SubjectState extends AggregateRoot {
  protected _id: SubjectId;
  protected _name: string;
  protected _schoolId: SchoolId;
  protected _recurrence: Recurrence;
  protected _time: TimeInterval;
  protected _groupId: GroupId;
  protected _requiredTeachers: RequiredTeachers;
  protected _createdAt: DateTime;
  protected _updatedAt: DateTime;

  public constructor(state: CreateSubjectState) {
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
  }
}

export {
  DailyRecurrence,
  WeeklyRecurrence,
  BiWeeklyRecurrence,
  MonthlyRecurrence,
};
