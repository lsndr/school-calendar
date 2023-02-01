import { Type } from '@mikro-orm/core';
import { EmployeeId } from '../domain';

export class EmployeeIdType extends Type<EmployeeId, string> {
  override convertToDatabaseValue(value: any) {
    if (value instanceof EmployeeId) {
      return value.value;
    }

    return value;
  }

  override convertToJSValue(value: any) {
    if (typeof value === 'string') {
      const id = Object.create(EmployeeId.prototype);

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
