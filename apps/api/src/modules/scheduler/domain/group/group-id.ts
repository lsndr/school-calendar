import { randomUUID } from 'crypto';
import { ValueObject } from '../../../shared/domain';

export class GroupId extends ValueObject<'GroupId'> {
  public readonly value: string;

  protected constructor(value: string) {
    super();

    this.value = value;
  }

  public static create(): GroupId {
    return new this(randomUUID());
  }
}
