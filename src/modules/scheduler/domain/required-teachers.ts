import * as assert from 'assert';
import { ValueObject } from '../../shared/domain';

export class RequiredTeachers extends ValueObject<'RequiredTeachers'> {
  readonly value: number;

  protected constructor(amount: number) {
    super();

    this.value = amount;
  }

  static create(amount: number) {
    assert.ok(Number.isInteger(amount), 'amount must be integer');
    assert.ok(amount > 0, 'amount must more than 0');
    assert.ok(amount < 4, 'amount must less than 4');

    return new this(amount);
  }
}