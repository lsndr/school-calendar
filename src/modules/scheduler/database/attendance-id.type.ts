import { Type } from '@mikro-orm/core';
import { AttendanceId } from '../domain';

export class AttendanceIdType extends Type<AttendanceId, string> {
  override convertToDatabaseValue(value: any) {
    if (value instanceof AttendanceId) {
      return value.value;
    }

    return value;
  }

  override convertToJSValue(value: any) {
    if (typeof value === 'string') {
      const id = Object.create(AttendanceId.prototype);

      return Object.assign(id, {
        value,
      });
    }

    return value;
  }

  override compareAsType() {
    return 'string';
  }
}
