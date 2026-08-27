import { ValueObject } from '../../../../shared/domain';
import { type RecurrenceType } from './types';

export abstract class BaseRecurrence<
  T extends RecurrenceType,
  V,
> extends ValueObject<V> {
  public readonly type!: T;

  protected constructor(type: T) {
    super();

    this.type = type;
  }
}
