import { Type } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { ExactDate } from '../domain';

export class ExactDateType extends Type<ExactDate, 'string'> {
  override convertToDatabaseValue(value: any) {
    if (value instanceof ExactDate) {
      return value.toDateTime().toSQLDate();
    }

    return value;
  }

  override convertToJSValue(value: any) {
    if (value instanceof DateTime) {
      const date = Object.create(ExactDate.prototype);

      return Object.assign(date, {
        month: value.month,
        year: value.year,
        day: value.day,
      });
    }

    return value;
  }

  override compareAsType() {
    return 'date';
  }
}
