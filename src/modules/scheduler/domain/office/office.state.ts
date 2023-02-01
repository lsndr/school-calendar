import { PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AggregateRoot } from '../../../shared/domain';
import { OfficeIdType, TimeZoneType } from '../../database';
import { OfficeId } from './office-id';
import { TimeZone } from './../shared';

type CreateOfficeState = {
  id: OfficeId;
  name: string;
  timeZone: TimeZone;
  createdAt: DateTime;
  updatedAt: DateTime;
};

export abstract class OfficeState extends AggregateRoot {
  @PrimaryKey({ name: 'id', type: OfficeIdType })
  protected _id: OfficeId;

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

  protected constructor(state: CreateOfficeState) {
    super();

    this._id = state.id;
    this._name = state.name;
    this._timeZone = state.timeZone;
    this._createdAt = state.createdAt;
    this._updatedAt = state.updatedAt;
    this._version = 1;
  }
}
