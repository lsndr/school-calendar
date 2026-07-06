import { Type } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { ExactDate } from '../domain/shared';

export class ExactDateType extends Type<ExactDate, string> {
  public override convertToDatabaseValue(value: unknown): string {
    if (value instanceof ExactDate) {
      return value.toDateTime().toSQLDate();
    }

    return value as string;
  }

  public override convertToJSValue(value: unknown): ExactDate {
    if (value instanceof DateTime) {
      const date = Object.create(ExactDate.prototype) as ExactDate;

      return Object.assign(date, {
        month: value.month,
        year: value.year,
        day: value.day,
      });
    }

    return value as ExactDate;
  }

  public override compareAsType(): string {
    return 'date';
  }
}
