import { Type } from '@mikro-orm/core';
import { LessonId } from '../domain';

export class LessonIdType extends Type<LessonId, string> {
  override convertToDatabaseValue(value: any) {
    if (value instanceof LessonId) {
      return value.value;
    }

    return value;
  }

  override convertToJSValue(value: any) {
    if (typeof value === 'string') {
      const id = Object.create(LessonId.prototype);

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
