import { DomainObject } from './domain-object';

export abstract class ValueObject<T> extends DomainObject {
  // @ts-expect-error: This hack introduces nominal typing
  private nominalTypeName: T;
}
