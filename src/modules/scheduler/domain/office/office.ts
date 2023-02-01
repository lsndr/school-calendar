import { Entity } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { OfficeId } from './office-id';
import { OfficeState } from './office.state';
import { TimeZone } from './../shared';

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
    const office = new this({
      id: data.id,
      name: data.name,
      timeZone: data.timeZone,
      createdAt: data.now,
      updatedAt: data.now,
    });

    return office;
  }
}
