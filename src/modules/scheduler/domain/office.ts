import { DateTime } from 'luxon';
import { Aggregate, AggregateState } from '../../shared/domain';
import { OfficeId } from './office-id';
import { TimeZone } from './time-zone';

export interface OfficeState extends AggregateState<OfficeId> {
  name: string;
  timeZone: TimeZone;
  createdAt: DateTime;
  updatedAt: DateTime;
}

type CreateOffice = {
  id: OfficeId;
  name: string;
  timeZone: TimeZone;
  now: DateTime;
};

export class Office extends Aggregate<OfficeId, OfficeState> {
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

  static create(data: CreateOffice) {
    return new this({
      id: data.id,
      name: data.name,
      timeZone: data.timeZone,
      createdAt: data.now,
      updatedAt: data.now,
    });
  }
}
