import { TimeZone } from '../../domain/time-zone';

export class TimeZoneHydrator extends TimeZone {
  constructor(timeZone: string) {
    super(timeZone);
  }
}
