import { type DateTime } from 'luxon';
import { AggregateRoot } from '../../../shared/domain';
import { type GroupId } from './group-id';
import { type SchoolId } from './../school';

export interface CreateGroupState {
  id: GroupId;
  name: string;
  schoolId: SchoolId;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export abstract class GroupState extends AggregateRoot {
  protected _id: GroupId;
  protected _name: string;
  protected _schoolId: SchoolId;
  protected _createdAt: DateTime;
  protected _updatedAt: DateTime;

  public constructor(state: CreateGroupState) {
    super();

    this._id = state.id;
    this._name = state.name;
    this._schoolId = state.schoolId;
    this._createdAt = state.createdAt;
    this._updatedAt = state.updatedAt;
  }
}
