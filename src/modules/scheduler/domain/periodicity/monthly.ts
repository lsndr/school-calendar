import { ValueObject } from '../../../shared/domain';
import { MonthDay } from './types';

export class MonthlyPeriodicity extends ValueObject<'MonthlyPeriodicity'> {
  public readonly type: 'monthly';
  public readonly days: ReadonlySet<MonthDay>;

  protected constructor(days: MonthDay[]) {
    super();

    this.type = 'monthly';
    this.days = new Set(days);
  }

  static create(days: MonthDay[]) {
    return new this(days);
  }
}
