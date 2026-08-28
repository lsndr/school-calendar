import { type DateTime } from 'luxon';
import { AggregateRoot } from '../../../shared/domain';
import { type SchoolId } from '../school';
import { type ExactDate, type TimeInterval } from '../shared';
import { type SubjectId } from '../subject';
import { type AssignedTeacher } from './assigned-teacher';
import { type LessonId } from './lesson-id';

export interface CreateLessonState {
  id: LessonId;
  subjectId: SubjectId;
  date: ExactDate;
  schoolId: SchoolId;
  time: TimeInterval;
  createdAt: DateTime;
  updatedAt: DateTime;
  assignedTeachers: AssignedTeacher[];
}

export abstract class LessonState extends AggregateRoot {
  protected _id: LessonId;
  protected _subjectId: SubjectId;
  protected _date: ExactDate;
  protected _schoolId: SchoolId;
  protected _assignedTeachers: AssignedTeacher[];
  protected _time: TimeInterval;
  protected _createdAt: DateTime;
  protected _updatedAt: DateTime;

  /** @protected Use for state recovery only */
  public constructor(state: CreateLessonState) {
    super();

    this._id = state.id;
    this._subjectId = state.subjectId;
    this._date = state.date;
    this._schoolId = state.schoolId;
    this._assignedTeachers = state.assignedTeachers;
    this._time = state.time;
    this._createdAt = state.createdAt;
    this._updatedAt = state.updatedAt;
  }
}
