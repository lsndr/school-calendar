import { BaseRecurrence } from './base';
import { RecurrenceType, type WeekDays } from './types';

export interface CreateBiWeeklyRecurrence {
  week1: (typeof WeekDays)[number][];
  week2: (typeof WeekDays)[number][];
}

export class BiWeeklyRecurrence extends BaseRecurrence<
  RecurrenceType.BiWeekly,
  'BiWeeklyRecurrence'
> {
  public readonly week1: readonly (typeof WeekDays)[number][];
  public readonly week2: readonly (typeof WeekDays)[number][];

  protected constructor(
    week1: (typeof WeekDays)[number][],
    week2: (typeof WeekDays)[number][],
  ) {
    super(RecurrenceType.BiWeekly);

    this.week1 = week1;
    this.week2 = week2;
  }

  public static create(data: CreateBiWeeklyRecurrence): BiWeeklyRecurrence {
    const week1 = Array.from(new Set(data.week1));
    const week2 = Array.from(new Set(data.week2));

    return new this(week1, week2);
  }
}
