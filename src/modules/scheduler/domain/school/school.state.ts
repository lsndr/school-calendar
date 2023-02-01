import { PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AggregateState } from '../../../shared/domain';
import { SchoolIdType, TimeZoneType } from '../../database';
import { SchoolId } from './school-id';
import { TimeZone } from './../shared';

type CreateSchoolState = {
  id: SchoolId;
  name: string;
  timeZone: TimeZone;
  createdAt: DateTime;
  updatedAt: DateTime;
};

export abstract class SchoolState extends AggregateState {
  @PrimaryKey({ name: 'id', type: SchoolIdType })
  protected _id: SchoolId;

  @Property({ name: 'name' })
  protected _name: string;

  @Property({ name: 'time_zone', type: TimeZoneType })
  protected _timeZone: TimeZone;

  @Property({ name: 'created_at' })
  protected _createdAt: DateTime;

  @Property({ name: 'updated_at' })
  protected _updatedAt: DateTime;

  @Property({ name: 'version', version: true })
  protected _version: number;

  protected constructor(state: CreateSchoolState) {
    super();

    this._id = state.id;
    this._name = state.name;
    this._timeZone = state.timeZone;
    this._createdAt = state.createdAt;
    this._updatedAt = state.updatedAt;
    this._version = 1;
  }
}
