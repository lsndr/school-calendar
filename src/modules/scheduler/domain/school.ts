import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AggregateState } from '../../shared/domain';
import { SchoolIdType, TimeZoneType } from '../database';
import { SchoolId } from './school-id';
import { TimeZone } from './time-zone';

abstract class SchoolState extends AggregateState {
  @PrimaryKey({ name: 'id', type: SchoolIdType })
  protected _id!: SchoolId;

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

type CreateSchool = {
  id: SchoolId;
  name: string;
  timeZone: TimeZone;
  now: DateTime;
};

@Entity()
export class School extends SchoolState {
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

  static create(data: CreateSchool) {
    const school = new this();

    school._id = data.id;
    school._name = data.name;
    school._timeZone = data.timeZone;
    school._createdAt = data.now;
    school._updatedAt = data.now;

    return school;
  }
}