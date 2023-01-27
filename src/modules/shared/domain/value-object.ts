export class ValueObject<T> {
  // @ts-expect-error: This hack introduces nominal typing
  private nominalTypeName: T;
}
