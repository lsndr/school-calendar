import { DateTime } from 'luxon';
import { ValueObject } from '../../../shared/domain';
import { type TimeZone } from './time-zone';

export interface ExactDateState {
  day: number;
  month: number;
  year: number;
}

export class ExactDate extends ValueObject<'ExactDate'> {
  public readonly day: number;
  public readonly month: number;
  public readonly year: number;

  protected constructor(state: ExactDateState) {
    super();

    this.day = state.day;
    this.month = state.month;
    this.year = state.year;
  }

  public static create(state: ExactDateState): ExactDate {
    const dateTime = DateTime.fromObject({
      year: state.year,
      month: state.month,
      day: state.day,
    });

    return this.fromDateTime(dateTime);
  }

  public static fromDateTime(dateTime: DateTime): ExactDate {
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

  public static createFromISO(date: string): ExactDate {
    const dateTime = DateTime.fromISO(date);

    return this.fromDateTime(dateTime);
  }

  public toDateTime(timeZone?: TimeZone): DateTime {
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
