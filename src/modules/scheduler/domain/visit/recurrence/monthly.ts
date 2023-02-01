import { ArrayType, Embeddable, Property } from '@mikro-orm/core';
import { BaseRecurrence } from './base';
import { MonthDays, RecurrenceType } from './types';

@Embeddable({ discriminatorValue: RecurrenceType.Monthly })
export class MonthlyRecurrence extends BaseRecurrence<
  RecurrenceType.Monthly,
  'MonthlyRecurrence'
> {
  @Property({ type: ArrayType })
  readonly days: ReadonlyArray<(typeof MonthDays)[number]>;

  protected constructor(days: (typeof MonthDays)[number][]) {
    super(RecurrenceType.Monthly);

    this.days = days;
  }

  static create(days: (typeof MonthDays)[number][]) {
    return new this(Array.from(new Set(days)));
  }
}
