import { IANAZone } from 'luxon';
import { ValueObject } from '../../../shared/domain';

export class TimeZone extends ValueObject<'TimeZone'> {
  public readonly value: string;

  protected constructor(value: string) {
    super();

    this.value = value;
  }

  static create(timeZone: string) {
    this.assert(IANAZone.isValidZone(timeZone), 'tz_invalid');

    return new this(timeZone);
  }
}
