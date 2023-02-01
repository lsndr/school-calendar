import { Embeddable, Property } from '@mikro-orm/core';
import * as assert from 'assert';
import { ValueObject } from '../../shared/domain';

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
    assert.ok(Number.isInteger(state.startsAt), 'startsAt must be integer');
    assert.ok(state.startsAt >= 0, 'startsAt should not be negative');
    assert.ok(state.startsAt < 1440, 'startsAt must less than 1440');

    assert.ok(Number.isInteger(state.duration), 'duration must be integer');
    assert.ok(state.duration > 0, 'duration should be positive');
    assert.ok(state.duration <= 1440, 'duration should not exceed 1440');

    return new this(state);
  }
}
