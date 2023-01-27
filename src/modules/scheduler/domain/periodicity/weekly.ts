import { ValueObject } from '../../../shared/domain';
import { WeekDay } from './types';

export class WeeklyPeriodicity extends ValueObject<'WeeklyPeriodicity'> {
  public readonly type: 'weekly';
  public readonly days: ReadonlyArray<WeekDay>;

  protected constructor(days: WeekDay[]) {
    super();

    this.type = 'weekly';
    this.days = days;
  }

  static create(days: WeekDay[]) {
    const uniqueDays = Array.from(new Set(days));

    return new this(uniqueDays);
  }
}
