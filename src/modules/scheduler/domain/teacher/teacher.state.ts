import { PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AggregateState } from '../../../shared/domain';
import { TeacherIdType, SchoolIdType } from '../../database';
import { TeacherId } from './teacher-id';
import { SchoolId } from './../school';

type CreateTeacherState = {
  id: TeacherId;
  name: string;
  schoolId: SchoolId;
  createdAt: DateTime;
  updatedAt: DateTime;
};

export abstract class TeacherState extends AggregateState {
  @PrimaryKey({ name: 'id', type: TeacherIdType })
  protected _id: TeacherId;

  @Property({ name: 'name' })
  protected _name: string;

  @Property({ name: 'school_id', type: SchoolIdType })
  protected _schoolId: SchoolId;

  @Property({ name: 'created_at' })
  protected _createdAt: DateTime;

  @Property({ name: 'updated_at' })
  protected _updatedAt: DateTime;

  @Property({ name: 'version', version: true })
  protected _version: number;

  constructor(state: CreateTeacherState) {
    super();

    this._id = state.id;
    this._name = state.name;
    this._schoolId = state.schoolId;
    this._createdAt = state.createdAt;
    this._updatedAt = state.updatedAt;
    this._version = 1;
  }
}
