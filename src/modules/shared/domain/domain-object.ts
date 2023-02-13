import { DomainError } from './domain-error';

export abstract class DomainObject {
  protected assert(expression: boolean, key: string) {
    if (!expression) {
      throw new DomainError(this.constructor.name, key);
    }
  }

  protected static assert(expression: boolean, key: string) {
    if (!expression) {
      throw new DomainError(this.name, key);
    }
  }
}
