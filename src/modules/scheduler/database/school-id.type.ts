import { Type } from '@mikro-orm/core';
import { SchoolId } from '../domain';

export class SchoolIdType extends Type<SchoolId, string> {
  override convertToDatabaseValue(value: any) {
    if (value instanceof SchoolId) {
      return value.value;
    }

    return value;
  }

  override convertToJSValue(value: any) {
    if (typeof value === 'string') {
      const id = Object.create(SchoolId.prototype);

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
