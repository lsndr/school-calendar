import { PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AggregateRoot } from '@shared/domain';
import { SchoolIdType, TimeZoneType } from '../../database';
import { SchoolId } from './school-id';
import { TimeZone } from './../shared';
import { DateTimeType } from '@shared/database/types';

type CreateSchoolState = {
  id: SchoolId;
  name: string;
  timeZone: TimeZone;
  createdAt: DateTime;
  updatedAt: DateTime;
};

export abstract class SchoolState extends AggregateRoot {
  @PrimaryKey({ name: 'id', type: SchoolIdType })
  protected _id: SchoolId;

  @Property({ name: 'name' })
  protected _name: string;

  @Property({ name: 'time_zone', type: TimeZoneType })
  protected _timeZone: TimeZone;

  @Property({ name: 'created_at', type: DateTimeType })
  protected _createdAt: DateTime;

  @Property({ name: 'updated_at', type: DateTimeType })
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
