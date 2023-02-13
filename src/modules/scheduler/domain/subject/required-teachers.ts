import { ValueObject } from '../../../shared/domain';

export class RequiredTeachers extends ValueObject<'RequiredTeachers'> {
  readonly value: number;

  protected constructor(amount: number) {
    super();

    this.value = amount;
  }

  static create(amount: number) {
    this.assert(Number.isInteger(amount), 'amoun_is_not_integer');
    this.assert(amount > 0, 'amount_is_negative');
    this.assert(amount < 4, 'amount_greater_than_3');

    return new this(amount);
  }
}
