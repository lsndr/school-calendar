export class DomainError extends Error {
  public readonly owner: string;
  public readonly key: string;

  public constructor(owner: string, key: string) {
    super(`Domain error "${key}" occured in "${owner}"`);

    this.owner = owner;
    this.key = key;
  }
}
