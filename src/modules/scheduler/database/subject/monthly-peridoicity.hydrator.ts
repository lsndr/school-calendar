import { MonthDay, MonthlyPeriodicity } from '../../domain';

export class MonthlyPeriodicityHydartor extends MonthlyPeriodicity {
  constructor(days: MonthDay[]) {
    super(days);
  }
}
