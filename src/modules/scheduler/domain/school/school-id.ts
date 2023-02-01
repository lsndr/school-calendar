import { randomUUID } from 'crypto';
import { ValueObject } from '../../../shared/domain';

export class SchoolId extends ValueObject<'SchoolId'> {
  public readonly value: string;

  protected constructor(value: string) {
    super();

    this.value = value;
  }

  static create() {
    return new this(randomUUID());
  }
}
