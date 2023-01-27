import { WeekDay, WeeklyPeriodicity } from '../../domain';

export class WeeklyPeriodicityHydartor extends WeeklyPeriodicity {
  constructor(days: WeekDay[]) {
    super(days);
  }
}
