import { Type } from '@mikro-orm/core';
import { LessonId } from '../domain/lesson/lesson-id';

export class LessonIdType extends Type<LessonId, string> {
  public override convertToDatabaseValue(value: LessonId | string): string {
    if (value instanceof LessonId) {
      return value.value;
    }

    return value;
  }

  public override convertToJSValue(value: string | LessonId): LessonId {
    if (typeof value === 'string') {
      const id = Object.create(LessonId.prototype) as LessonId;

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
