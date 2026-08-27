import { BaseRecurrence } from './base';
import { RecurrenceType } from './types';

export class DailyRecurrence extends BaseRecurrence<
  RecurrenceType.Daily,
  'DailyRecurrence'
> {
  public static create(): DailyRecurrence {
    return new this(RecurrenceType.Daily);
  }
}
