import { PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AggregateRoot } from '../../../shared/domain';
import { TeacherIdType, SchoolIdType } from '../../database';
import { TeacherId } from './teacher-id';
import { SchoolId } from './../school';
import { DateTimeType } from '../../../shared/database/types';

type CreateTeacherState = {
  id: TeacherId;
  name: string;
  schoolId: SchoolId;
  createdAt: DateTime;
  updatedAt: DateTime;
};

export abstract class TeacherState extends AggregateRoot {
  @PrimaryKey({ name: 'id', type: TeacherIdType })
  protected _id: TeacherId;

  @Property({ name: 'name' })
  protected _name: string;

  @Property({ name: 'school_id', type: SchoolIdType })
  protected _schoolId: SchoolId;

  @Property({ name: 'created_at', type: DateTimeType })
  protected _createdAt: DateTime;

  @Property({ name: 'updated_at', type: DateTimeType })
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
