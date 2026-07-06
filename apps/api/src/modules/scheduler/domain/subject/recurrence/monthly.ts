import { ArrayType, Embeddable, Property } from '@mikro-orm/core';
import { BaseRecurrence } from './base';
import { MonthDays, RecurrenceType } from './types';

@Embeddable({ discriminatorValue: RecurrenceType.Monthly })
export class MonthlyRecurrence extends BaseRecurrence<
  RecurrenceType.Monthly,
  'MonthlyRecurrence'
> {
  @Property({ type: ArrayType })
  public readonly days: readonly (typeof MonthDays)[number][];

  protected constructor(days: (typeof MonthDays)[number][]) {
    super(RecurrenceType.Monthly);

    this.days = days;
  }

  public static create(days: (typeof MonthDays)[number][]): MonthlyRecurrence {
    return new this(Array.from(new Set(days)));
  }
}
