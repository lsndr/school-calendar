import { DateTime } from 'luxon';
import { ValueObject } from '../../../shared/domain';
import { TimeZone } from './time-zone';

export type ExactDateState = {
  day: number;
  month: number;
  year: number;
};

export class ExactDate extends ValueObject<'ExactDate'> {
  readonly day: number;
  readonly month: number;
  readonly year: number;

  protected constructor(state: ExactDateState) {
    super();

    this.day = state.day;
    this.month = state.month;
    this.year = state.year;
  }

  static create(state: ExactDateState) {
    const dateTime = DateTime.fromObject({
      year: state.year,
      month: state.month,
      day: state.day,
    });

    return this.fromDateTime(dateTime);
  }

  static fromDateTime(dateTime: DateTime) {
    this.assert(
      dateTime.isValid && dateTime.toMillis() > 0,
      'datetime_invalid',
    );

    return new this({
      day: dateTime.day,
      month: dateTime.month,
      year: dateTime.year,
    });
  }

  static createFromISO(date: string) {
    const dateTime = DateTime.fromISO(date);

    return this.fromDateTime(dateTime);
  }

  toDateTime(timeZone?: TimeZone) {
    return DateTime.fromObject(
      {
        year: this.year,
        month: this.month,
        day: this.day,
      },
      {
        zone: timeZone?.value,
      },
    );
  }
}
