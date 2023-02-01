import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AggregateState } from '../../shared/domain';
import { OfficeIdType, TimeZoneType } from '../database';
import { OfficeId } from './office-id';
import { TimeZone } from './time-zone';

abstract class OfficeState extends AggregateState {
  @PrimaryKey({ name: 'id', type: OfficeIdType })
  protected _id!: OfficeId;

  @Property({ name: 'name' })
  protected _name!: string;

  @Property({ name: 'time_zone', type: TimeZoneType })
  protected _timeZone!: TimeZone;

  @Property({ name: 'created_at' })
  protected _createdAt!: DateTime;

  @Property({ name: 'updated_at' })
  protected _updatedAt!: DateTime;

  @Property({ name: 'version', version: true })
  protected _version!: number;
}

type CreateOffice = {
  id: OfficeId;
  name: string;
  timeZone: TimeZone;
  now: DateTime;
};

@Entity()
export class Office extends OfficeState {
  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get timeZone() {
    return this._timeZone;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  static create(data: CreateOffice) {
    const office = new this();

    office._id = data.id;
    office._name = data.name;
    office._timeZone = data.timeZone;
    office._createdAt = data.now;
    office._updatedAt = data.now;

    return office;
  }
}
