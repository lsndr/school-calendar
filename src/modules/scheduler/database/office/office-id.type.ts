import { Type } from '@mikro-orm/core';
import { OfficeId } from '../../domain';

export class OfficeIdType extends Type<OfficeId, string> {
  override convertToDatabaseValue(value: any) {
    if (value instanceof OfficeId) {
      return value.value;
    }

    return value;
  }

  override convertToJSValue(value: any) {
    if (typeof value === 'string') {
      const id = Object.create(OfficeId.prototype);

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
