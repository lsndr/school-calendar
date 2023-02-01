import { Type } from '@mikro-orm/core';
import { VisitId } from '../domain/visit/visit-id';

export class VisitIdType extends Type<VisitId, string> {
  override convertToDatabaseValue(value: any) {
    if (value instanceof VisitId) {
      return value.value;
    }

    return value;
  }

  override convertToJSValue(value: any) {
    if (typeof value === 'string') {
      const id = Object.create(VisitId.prototype);

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
