import { Entity } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { SchoolId } from './school-id';
import { SchoolState } from './school.state';
import { TimeZone } from './../shared';

interface CreateSchool {
  id: SchoolId;
  name: string;
  timeZone: TimeZone;
  now: DateTime;
}

@Entity()
export class School extends SchoolState {
  public get id(): SchoolId {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get timeZone(): TimeZone {
    return this._timeZone;
  }

  public get createdAt(): DateTime {
    return this._createdAt;
  }

  public get updatedAt(): DateTime {
    return this._updatedAt;
  }

  public static create(data: CreateSchool): School {
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
