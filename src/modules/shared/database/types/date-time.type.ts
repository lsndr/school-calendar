import { Type, ValidationError } from '@mikro-orm/core';
import { DateTime } from 'luxon';

export class DateTimeType extends Type<DateTime, string> {
  override convertToDatabaseValue(value: unknown) {
    if (value instanceof DateTime) {
      return value.toLocal().toSQL();
    } else if (typeof value === 'string') {
      return value;
    }

    throw ValidationError.invalidType(DateTimeType, value, 'JS');
  }

  override convertToJSValue(value: unknown) {
    if (value instanceof DateTime) {
      return value;
    } else if (typeof value === 'string') {
      return DateTime.fromSQL(value, { setZone: true });
    }

    throw ValidationError.invalidType(DateTimeType, value, 'database');
  }

  override compareAsType() {
    return 'date';
  }

  override toJSON(value: unknown) {
    return JSON.stringify(value);
  }

  override getColumnType() {
    return `timestamp`;
  }
}
