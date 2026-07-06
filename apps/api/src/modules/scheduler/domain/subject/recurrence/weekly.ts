import { ArrayType, Embeddable, Property } from '@mikro-orm/core';
import { BaseRecurrence } from './base';
import { RecurrenceType, WeekDays } from './types';

@Embeddable({ discriminatorValue: RecurrenceType.Weekly })
export class WeeklyRecurrence extends BaseRecurrence<
  RecurrenceType.Weekly,
  'WeeklyRecurrence'
> {
  @Property({ type: ArrayType })
  public readonly days: readonly (typeof WeekDays)[number][];

  protected constructor(days: (typeof WeekDays)[number][]) {
    super(RecurrenceType.Weekly);

    this.days = days;
  }

  public static create(days: (typeof WeekDays)[number][]): WeeklyRecurrence {
    return new this(Array.from(new Set(days)));
  }
}
