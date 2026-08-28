import { randomUUID } from 'crypto';
import { ValueObject } from '../../../shared/domain';

export class SchoolId extends ValueObject<'SchoolId'> {
  public readonly value: string;

  /** @protected Use for state recovery only */
  public constructor(value: string) {
    super();

    this.value = value;
  }

  public static create(): SchoolId {
    return new this(randomUUID());
  }
}
