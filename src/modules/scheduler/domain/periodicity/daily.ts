import { ValueObject } from '../../../shared/domain';

export class DailyPeriodicity extends ValueObject<'DailyPeriodicity'> {
  public readonly type: 'daily';

  protected constructor() {
    super();

    this.type = 'daily';
  }

  static create() {
    return new this();
  }
}
