import { Type } from '@mikro-orm/core';
import { TeacherId } from '../domain/teacher/teacher-id';

export class TeacherIdType extends Type<TeacherId, string> {
  public override convertToDatabaseValue(value: TeacherId | string): string {
    if (value instanceof TeacherId) {
      return value.value;
    }

    return value;
  }

  public override convertToJSValue(value: string | TeacherId): TeacherId {
    if (typeof value === 'string') {
      const id = Object.create(TeacherId.prototype) as TeacherId;

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
