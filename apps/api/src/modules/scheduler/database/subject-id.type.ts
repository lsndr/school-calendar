import { Type } from '@mikro-orm/core';
import { SubjectId } from '../domain/subject/subject-id';

export class SubjectIdType extends Type<SubjectId, string> {
  public override convertToDatabaseValue(value: SubjectId | string): string {
    if (value instanceof SubjectId) {
      return value.value;
    }

    return value;
  }

  public override convertToJSValue(value: string | SubjectId): SubjectId {
    if (typeof value === 'string') {
      const id = Object.create(SubjectId.prototype) as SubjectId;

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
