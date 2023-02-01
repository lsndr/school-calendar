import { Type, ValidationError } from '@mikro-orm/core';
import { TimeZone } from '../../domain';

export class TimeZoneType extends Type<TimeZone, string> {
  override convertToDatabaseValue(value: unknown) {
    if (value instanceof TimeZone) {
      return value.value;
    } else if (typeof value === 'string') {
      return value;
    }

    throw ValidationError.invalidType(TimeZoneType, value, 'JS');
  }

  override convertToJSValue(value: unknown) {
    if (value instanceof TimeZone) {
      return value;
    } else if (typeof value === 'string') {
      const id = Object.create(TimeZone.prototype);

      return Object.assign(id, {
        value,
      });
    }

    throw ValidationError.invalidType(TimeZoneType, value, 'database');
  }

  override compareAsType() {
    return 'string';
  }

  override toJSON(value: unknown) {
    return JSON.stringify(value);
  }

  override getColumnType() {
    return `text`;
  }
}
