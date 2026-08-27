import { BaseRecurrence } from './base';
import { RecurrenceType, type WeekDays } from './types';

export class WeeklyRecurrence extends BaseRecurrence<
  RecurrenceType.Weekly,
  'WeeklyRecurrence'
> {
  public readonly days: readonly (typeof WeekDays)[number][];

  protected constructor(days: (typeof WeekDays)[number][]) {
    super(RecurrenceType.Weekly);

    this.days = days;
  }

  public static create(days: (typeof WeekDays)[number][]): WeeklyRecurrence {
    return new this(Array.from(new Set(days)));
  }
}
