import { ArrayType, Embeddable, Property } from '@mikro-orm/core';
import { BaseRecurrence } from './base';
import { RecurrenceType, WeekDays } from './types';

@Embeddable({ discriminatorValue: RecurrenceType.Weekly })
export class WeeklyRecurrence extends BaseRecurrence<
  RecurrenceType.Weekly,
  'WeeklyRecurrence'
> {
  @Property({ type: ArrayType })
  readonly days: ReadonlyArray<(typeof WeekDays)[number]>;

  protected constructor(days: (typeof WeekDays)[number][]) {
    super(RecurrenceType.Weekly);

    this.days = days;
  }

  static create(days: (typeof WeekDays)[number][]) {
    return new this(Array.from(new Set(days)));
  }
}
