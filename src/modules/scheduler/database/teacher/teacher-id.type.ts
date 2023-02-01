import { Type } from '@mikro-orm/core';
import { TeacherId } from '../../domain';

export class TeacherIdType extends Type<TeacherId, string> {
  override convertToDatabaseValue(value: any) {
    if (value instanceof TeacherId) {
      return value.value;
    }

    return value;
  }

  override convertToJSValue(value: any) {
    if (typeof value === 'string') {
      const id = Object.create(TeacherId.prototype);

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