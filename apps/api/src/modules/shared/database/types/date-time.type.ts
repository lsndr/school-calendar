import { Type, ValidationError } from '@mikro-orm/core';
import { DateTime } from 'luxon';

export class DateTimeType extends Type<DateTime, string> {
  public override convertToDatabaseValue(value: unknown): string {
    if (value instanceof DateTime) {
      return value.toLocal().toSQL();
    } else if (typeof value === 'string') {
      return value;
    }

    throw ValidationError.invalidType(DateTimeType, value, 'JS');
  }

  public override convertToJSValue(value: unknown): DateTime {
    if (value instanceof DateTime) {
      return value;
    } else if (typeof value === 'string') {
      return DateTime.fromSQL(value, { setZone: true });
    }

    throw ValidationError.invalidType(DateTimeType, value, 'database');
  }

  public override compareAsType(): string {
    return 'date';
  }

  public override toJSON(value: unknown): string {
    return JSON.stringify(value);
  }

  public override getColumnType(): string {
    return `timestamp`;
  }
}
