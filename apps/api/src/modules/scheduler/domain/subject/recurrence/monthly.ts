import { BaseRecurrence } from './base';
import { type MonthDays, RecurrenceType } from './types';

export class MonthlyRecurrence extends BaseRecurrence<
  RecurrenceType.Monthly,
  'MonthlyRecurrence'
> {
  public readonly days: readonly (typeof MonthDays)[number][];

  protected constructor(days: (typeof MonthDays)[number][]) {
    super(RecurrenceType.Monthly);

    this.days = days;
  }

  public static create(days: (typeof MonthDays)[number][]): MonthlyRecurrence {
    return new this(Array.from(new Set(days)));
  }
}
