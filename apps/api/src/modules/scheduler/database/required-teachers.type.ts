import { Type } from '@mikro-orm/core';
import { RequiredTeachers } from '../domain/subject/required-teachers';

export class RequiredTeachersType extends Type<RequiredTeachers, number> {
  public override convertToDatabaseValue(
    value: RequiredTeachers | number,
  ): number {
    if (value instanceof RequiredTeachers) {
      return value.value;
    }

    return value;
  }

  public override convertToJSValue(
    value: number | RequiredTeachers,
  ): RequiredTeachers {
    if (typeof value === 'number') {
      const vo = Object.create(RequiredTeachers.prototype) as RequiredTeachers;

      return Object.assign(vo, {
        value,
      });
    }

    return value;
  }

  public override compareAsType(): string {
    return 'number';
  }
}
