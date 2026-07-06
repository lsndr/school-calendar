import { randomUUID } from 'crypto';
import { ValueObject } from '../../../shared/domain';

export class SubjectId extends ValueObject<'SubjectId'> {
  public readonly value: string;

  protected constructor(value: string) {
    super();

    this.value = value;
  }

  public static create(): SubjectId {
    return new this(randomUUID());
  }
}
