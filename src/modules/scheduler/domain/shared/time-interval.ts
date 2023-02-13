import { Embeddable, Property } from '@mikro-orm/core';
import { ValueObject } from '../../../shared/domain';

export type TimeIntervalState = {
  startsAt: number;
  duration: number;
};

@Embeddable()
export class TimeInterval extends ValueObject<'TimeInterval'> {
  @Property()
  public readonly startsAt: number;

  @Property()
  public readonly duration: number;

  protected constructor(state: TimeIntervalState) {
    super();

    this.startsAt = state.startsAt;
    this.duration = state.duration;
  }

  static create(state: TimeIntervalState) {
    this.assert(Number.isInteger(state.startsAt), 'startsat_is_not_integer');
    this.assert(state.startsAt >= 0, 'startsat_is_negative');
    this.assert(state.startsAt < 1440, 'startsat_greater_than_1339');

    this.assert(Number.isInteger(state.duration), 'duration_is_not_integer');
    this.assert(state.duration > 0, 'duration_is_negative');
    this.assert(state.duration <= 1440, 'duration_greater_than_1440');

    return new this(state);
  }
}
