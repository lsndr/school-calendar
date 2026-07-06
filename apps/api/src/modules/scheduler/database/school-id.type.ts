import { Type } from '@mikro-orm/core';
import { SchoolId } from '../domain/school/school-id';

export class SchoolIdType extends Type<SchoolId, string> {
  public override convertToDatabaseValue(value: SchoolId | string): string {
    if (value instanceof SchoolId) {
      return value.value;
    }

    return value;
  }

  public override convertToJSValue(value: string | SchoolId): SchoolId {
    if (typeof value === 'string') {
      const id = Object.create(SchoolId.prototype) as SchoolId;

      return Object.assign(id, {
        value,
      });
    }

    return value;
  }

  public override compareAsType(): string {
    return 'string';
  }
}
