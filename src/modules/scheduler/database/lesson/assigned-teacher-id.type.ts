import { Type } from '@mikro-orm/core';
import { AssignedTeacherId } from '../../domain';

export class AssignedTeacherIdType extends Type<AssignedTeacherId, string> {
  override convertToDatabaseValue(value: any) {
    if (value instanceof AssignedTeacherId) {
      return value.value;
    }

    return value;
  }

  override convertToJSValue(value: any) {
    if (typeof value === 'string') {
      const id = Object.create(AssignedTeacherId.prototype);

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
