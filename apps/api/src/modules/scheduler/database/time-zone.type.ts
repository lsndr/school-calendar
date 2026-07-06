import { Type, ValidationError } from '@mikro-orm/core';
import { TimeZone } from '../domain/shared';

export class TimeZoneType extends Type<TimeZone, string> {
  public override convertToDatabaseValue(value: unknown): string {
    if (value instanceof TimeZone) {
      return value.value;
    } else if (typeof value === 'string') {
      return value;
    }

    throw ValidationError.invalidType(TimeZoneType, value, 'JS');
  }

  public override convertToJSValue(value: unknown): TimeZone {
    if (value instanceof TimeZone) {
      return value;
    } else if (typeof value === 'string') {
      const id = Object.create(TimeZone.prototype) as TimeZone;

      return Object.assign(id, {
        value,
      });
    }

    throw ValidationError.invalidType(TimeZoneType, value, 'database');
  }

  public override compareAsType(): string {
    return 'string';
  }

  public override toJSON(value: unknown): string {
    return JSON.stringify(value);
  }

  public override getColumnType(): string {
    return `text`;
  }
}
