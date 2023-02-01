import { ArrayType, Embeddable, Property } from '@mikro-orm/core';
import { BaseRecurrence } from './base';
import { RecurrenceType, WeekDays } from './types';

export type CreateBiWeeklyRecurrence = {
  week1: (typeof WeekDays)[number][];
  week2: (typeof WeekDays)[number][];
};

@Embeddable({ discriminatorValue: RecurrenceType.BiWeekly })
export class BiWeeklyRecurrence extends BaseRecurrence<
  RecurrenceType.BiWeekly,
  'BiWeeklyRecurrence'
> {
  @Property({ type: ArrayType })
  readonly week1: ReadonlyArray<(typeof WeekDays)[number]>;

  @Property({ type: ArrayType })
  readonly week2: ReadonlyArray<(typeof WeekDays)[number]>;

  protected constructor(
    week1: (typeof WeekDays)[number][],
    week2: (typeof WeekDays)[number][],
  ) {
    super(RecurrenceType.BiWeekly);

    this.week1 = week1;
    this.week2 = week2;
  }

  static create(data: CreateBiWeeklyRecurrence) {
    const week1 = Array.from(new Set(data.week1));
    const week2 = Array.from(new Set(data.week2));

    return new this(week1, week2);
  }
}
