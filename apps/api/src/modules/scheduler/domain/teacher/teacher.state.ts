import { type DateTime } from 'luxon';
import { AggregateRoot } from '../../../shared/domain';
import { type TeacherId } from './teacher-id';
import { type SchoolId } from './../school';

export interface CreateTeacherState {
  id: TeacherId;
  name: string;
  schoolId: SchoolId;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export abstract class TeacherState extends AggregateRoot {
  protected _id: TeacherId;
  protected _name: string;
  protected _schoolId: SchoolId;
  protected _createdAt: DateTime;
  protected _updatedAt: DateTime;

  /** @protected Use for state recovery only */
  public constructor(state: CreateTeacherState) {
    super();

    this._id = state.id;
    this._name = state.name;
    this._schoolId = state.schoolId;
    this._createdAt = state.createdAt;
    this._updatedAt = state.updatedAt;
  }
}
