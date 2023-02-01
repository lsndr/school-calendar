import { randomUUID } from 'crypto';
import { ValueObject } from '../../../shared/domain';

export class AssignedEmployeeId extends ValueObject<'AssignedEmployeeId'> {
  public readonly value: string;

  protected constructor(value: string) {
    super();

    this.value = value;
  }

  static create() {
    return new this(randomUUID());
  }
}
