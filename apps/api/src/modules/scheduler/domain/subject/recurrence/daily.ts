import { Embeddable } from '@mikro-orm/core';
import { BaseRecurrence } from './base';
import { RecurrenceType } from './types';

@Embeddable({ discriminatorValue: RecurrenceType.Daily })
export class DailyRecurrence extends BaseRecurrence<
  RecurrenceType.Daily,
  'DailyRecurrence'
> {
  public static create(): DailyRecurrence {
    return new this(RecurrenceType.Daily);
  }
}
