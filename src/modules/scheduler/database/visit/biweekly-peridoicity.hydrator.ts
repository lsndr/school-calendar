import { BiWeeklyPeriodicity, BiWeeklyPeriodicityState } from '../../domain';

export class BiWeeklyPeriodicityHydartor extends BiWeeklyPeriodicity {
  constructor(state: BiWeeklyPeriodicityState) {
    super(state);
  }
}
