import { randomUUID } from 'crypto';
import { ValueObject } from '../../../shared/domain';

export class TeacherId extends ValueObject<'TeacherId'> {
  public readonly value: string;

  protected constructor(value: string) {
    super();

    this.value = value;
  }

  public static create(): TeacherId {
    return new this(randomUUID());
  }
}
