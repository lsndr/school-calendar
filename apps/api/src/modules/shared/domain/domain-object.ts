import { DomainError } from './domain-error';

export abstract class DomainObject {
  protected static assert(expression: boolean, key: string): void {
    if (!expression) {
      throw new DomainError(this.name, key);
    }
  }

  protected assert(expression: boolean, key: string): void {
    if (!expression) {
      throw new DomainError(this.constructor.name, key);
    }
  }
}
