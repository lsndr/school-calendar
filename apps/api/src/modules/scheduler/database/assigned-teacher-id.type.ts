import { Type } from '@mikro-orm/core';
import { AssignedTeacherId } from '../domain/lesson/assigned-teacher-id';

export class AssignedTeacherIdType extends Type<AssignedTeacherId, string> {
  public override convertToDatabaseValue(
    value: AssignedTeacherId | string,
  ): string {
    if (value instanceof AssignedTeacherId) {
      return value.value;
    }

    return value;
  }

  public override convertToJSValue(
    value: string | AssignedTeacherId,
  ): AssignedTeacherId {
    if (typeof value === 'string') {
      const id = Object.create(
        AssignedTeacherId.prototype,
      ) as AssignedTeacherId;

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
