import { Entity } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { SchoolId } from './school-id';
import { SchoolState } from './school.state';
import { TimeZone } from './../shared';

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
    const school = new this({
      id: data.id,
      name: data.name,
      timeZone: data.timeZone,
      createdAt: data.now,
      updatedAt: data.now,
    });

    return school;
  }
}
