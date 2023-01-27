import * as assert from 'assert';
import { IANAZone } from 'luxon';
import { ValueObject } from '../../shared/domain';

export class TimeZone extends ValueObject<'TimeZone'> {
  public readonly value: string;

  protected constructor(value: string) {
    super();

    this.value = value;
  }

  static create(timeZone: string) {
    assert.ok(IANAZone.isValidZone(timeZone), 'Time zone is invalid');

    return new this(timeZone);
  }
}
