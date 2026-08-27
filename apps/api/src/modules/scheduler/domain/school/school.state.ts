import { type DateTime } from 'luxon';
import { AggregateRoot } from '../../../shared/domain';
import { type SchoolId } from './school-id';
import { type TimeZone } from './../shared';

export interface CreateSchoolState {
  id: SchoolId;
  name: string;
  timeZone: TimeZone;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export abstract class SchoolState extends AggregateRoot {
  protected _id: SchoolId;
  protected _name: string;
  protected _timeZone: TimeZone;
  protected _createdAt: DateTime;
  protected _updatedAt: DateTime;

  public constructor(state: CreateSchoolState) {
    super();

    this._id = state.id;
    this._name = state.name;
    this._timeZone = state.timeZone;
    this._createdAt = state.createdAt;
    this._updatedAt = state.updatedAt;
  }
}
