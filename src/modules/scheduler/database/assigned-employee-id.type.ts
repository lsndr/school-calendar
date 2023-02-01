import { Type } from '@mikro-orm/core';
import { AssignedEmployeeId } from '../domain';

export class AssignedEmployeeIdType extends Type<AssignedEmployeeId, string> {
  override convertToDatabaseValue(value: any) {
    if (value instanceof AssignedEmployeeId) {
      return value.value;
    }

    return value;
  }

  override convertToJSValue(value: any) {
    if (typeof value === 'string') {
      const id = Object.create(AssignedEmployeeId.prototype);

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
