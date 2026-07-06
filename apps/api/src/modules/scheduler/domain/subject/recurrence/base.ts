import { Embeddable, Property } from '@mikro-orm/core';
import { ValueObject } from '../../../../shared/domain';
import { RecurrenceType } from './types';

@Embeddable({ abstract: true, discriminatorColumn: 'type' })
export abstract class BaseRecurrence<
  T extends RecurrenceType,
  V,
> extends ValueObject<V> {
  @Property({ type: 'string' })
  public readonly type!: T;

  protected constructor(type: T) {
    super();

    this.type = type;
  }
}
