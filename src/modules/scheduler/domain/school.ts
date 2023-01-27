import { DateTime } from 'luxon';
import { Aggregate, AggregateState } from '../../shared/domain';
import { SchoolId } from './school-id';
import { TimeZone } from './time-zone';

export interface SchoolState extends AggregateState<SchoolId> {
  name: string;
  timeZone: TimeZone;
  createdAt: DateTime;
  updatedAt: DateTime;
}

type CreateSchool = {
  id: SchoolId;
  name: string;
  timeZone: TimeZone;
  now: DateTime;
};

export class School extends Aggregate<SchoolId, SchoolState> {
  get name() {
    return this.state.name;
  }

  get timeZone() {
    return this.state.timeZone;
  }

  get createdAt() {
    return this.state.createdAt;
  }

  get updatedAt() {
    return this.state.updatedAt;
  }

  static create(data: CreateSchool) {
    return new this({
      id: data.id,
      name: data.name,
      timeZone: data.timeZone,
      createdAt: data.now,
      updatedAt: data.now,
    });
  }
}
