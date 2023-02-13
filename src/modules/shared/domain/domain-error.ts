export class DomainError extends Error {
  readonly owner: string;
  readonly key: string;

  constructor(owner: string, key: string) {
    super(`Domain error "${key}" occured in "${owner}"`);

    this.owner = owner;
    this.key = key;
  }
}
