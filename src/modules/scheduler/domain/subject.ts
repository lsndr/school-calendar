import * as assert from 'assert';
import { DateTime } from 'luxon';
import { Aggregate, AggregateState } from '../../shared/domain';
import { Group } from './group';
import { GroupId } from './group-id';
import { School } from './school';
import { SchoolId } from './school-id';
import {
  BiWeeklyPeriodicity,
  DailyPeriodicity,
  MonthlyPeriodicity,
  WeeklyPeriodicity,
} from './periodicity';
import { RequiredTeachers } from './required-teachers';
import { TimeInterval } from './time-interval';
import { SubjectId } from './subject-id';

export type SubjectPeriodicity =
  | DailyPeriodicity
  | WeeklyPeriodicity
  | BiWeeklyPeriodicity
  | MonthlyPeriodicity;

export interface SubjectState extends AggregateState<SubjectId> {
  id: SubjectId;
  schoolId: SchoolId;
  name: string;
  periodicity: SubjectPeriodicity;
  timeInterval: TimeInterval;
  groupId: GroupId;
  requiredTeachers: RequiredTeachers;
  createdAt: DateTime;
  updatedAt: DateTime;
}

type CreateSubject = {
  id: SubjectId;
  name: string;
  school: School;
  periodicity: SubjectPeriodicity;
  timeInterval: TimeInterval;
  group: Group;
  requiredTeachers: RequiredTeachers;
  now: DateTime;
};

export class Subject extends Aggregate<SubjectId, SubjectState> {
  get schoolId() {
    return this.state.schoolId;
  }

  get name() {
    return this.state.name;
  }

  get periodicity() {
    return this.state.periodicity;
  }

  get groupId() {
    return this.state.groupId;
  }

  get requiredTeachers() {
    return this.state.requiredTeachers;
  }

  get timeInterval() {
    return this.state.timeInterval;
  }

  get createdAt() {
    return this.state.createdAt;
  }

  get updatedAt() {
    return this.state.updatedAt;
  }

  static create(data: CreateSubject) {
    assert.ok(
      data.school.id.value === data.group.schoolId.value,
      'School id and group school id must match',
    );

    return new this({
      id: data.id,
      groupId: data.group.id,
      schoolId: data.school.id,
      name: data.name,
      requiredTeachers: data.requiredTeachers,
      periodicity: data.periodicity,
      timeInterval: data.timeInterval,
      createdAt: data.now,
      updatedAt: data.now,
    });
  }

  setName(name: string, updatedAt: DateTime) {
    this.state.name = name;
    this.state.updatedAt = updatedAt;
  }

  setPeriodicity(periodicity: SubjectPeriodicity, updatedAt: DateTime) {
    this.state.periodicity = periodicity;
    this.state.updatedAt = updatedAt;
  }

  setTimeInterval(timeInterval: TimeInterval, updatedAt: DateTime) {
    this.state.timeInterval = timeInterval;
    this.state.updatedAt = updatedAt;
  }
}
