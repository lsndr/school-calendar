import { Type } from '@mikro-orm/core';
import { RequiredEmployees } from '../domain/visit/required-employees';

export class RequiredEmployeesType extends Type<RequiredEmployees, number> {
  override convertToDatabaseValue(value: any) {
    if (value instanceof RequiredEmployees) {
      return value.value;
    }

    return value;
  }

  override convertToJSValue(value: any) {
    if (typeof value === 'number') {
      const vo = Object.create(RequiredEmployees.prototype);

      return Object.assign(vo, {
        value,
      });
    }

    return value;
  }

  override compareAsType() {
    return 'number';
  }
}
