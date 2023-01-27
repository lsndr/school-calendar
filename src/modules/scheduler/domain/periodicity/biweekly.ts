import { ValueObject } from '../../../shared/domain';
import { WeekDay } from './types';

export type BiWeeklyPeriodicityState = {
  week1: WeekDay[];
  week2: WeekDay[];
};

export class BiWeeklyPeriodicity extends ValueObject<'BiWeeklyPeriodicity'> {
  public readonly type: 'biweekly';

  public readonly week1: ReadonlyArray<WeekDay>;
  public readonly week2: ReadonlyArray<WeekDay>;

  protected constructor(state: BiWeeklyPeriodicityState) {
    super();

    this.type = 'biweekly';
    this.week1 = state.week1;
    this.week2 = state.week2;
  }

  static create(state: BiWeeklyPeriodicityState) {
    const week1 = Array.from(new Set(state.week1));
    const week2 = Array.from(new Set(state.week2));

    return new this({ week1, week2 });
  }
}
