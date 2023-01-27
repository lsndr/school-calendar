import { TimeInterval, TimeIntervalState } from '../../domain';

export class TimeIntervalHydartor extends TimeInterval {
  constructor(state: TimeIntervalState) {
    super(state);
  }
}
