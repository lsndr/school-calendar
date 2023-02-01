import { Type } from '@mikro-orm/core';
import { SubjectId } from '../domain';

export class SubjectIdType extends Type<SubjectId, string> {
  override convertToDatabaseValue(value: any) {
    if (value instanceof SubjectId) {
      return value.value;
    }

    return value;
  }

  override convertToJSValue(value: any) {
    if (typeof value === 'string') {
      const id = Object.create(SubjectId.prototype);

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
