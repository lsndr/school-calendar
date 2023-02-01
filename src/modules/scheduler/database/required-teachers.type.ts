import { Type } from '@mikro-orm/core';
import { RequiredTeachers } from '../domain/subject/required-teachers';

export class RequiredTeachersType extends Type<RequiredTeachers, number> {
  override convertToDatabaseValue(value: any) {
    if (value instanceof RequiredTeachers) {
      return value.value;
    }

    return value;
  }

  override convertToJSValue(value: any) {
    if (typeof value === 'number') {
      const vo = Object.create(RequiredTeachers.prototype);

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
