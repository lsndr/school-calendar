import { randomUUID } from 'crypto';
import { ValueObject } from '../../../shared/domain';

export class AssignedTeacherId extends ValueObject<'AssignedTeacherId'> {
  public readonly value: string;

  protected constructor(value: string) {
    super();

    this.value = value;
  }

  public static create(): AssignedTeacherId {
    return new this(randomUUID());
  }
}
