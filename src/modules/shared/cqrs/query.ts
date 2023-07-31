// eslint-disable-next-line no-restricted-imports -- Allowed only here
import {
  QueryHandler as BaseQueryHandler,
  QueryBus as BaseQueryBus,
} from '@nestjs/cqrs';

export class Query<R = void> {
  // @ts-expect-error -- Needed for inference
  private __resultType!: R;
}

export type QueryProps<T extends Query<unknown>> = {
  readonly [P in keyof T]: T[P];
};

export type QueryResult<Q extends Query<unknown>> = Q extends Query<infer R>
  ? R
  : never;

export interface QueryHandler<Q extends Query<unknown>> {
  execute(query: Q): Promise<QueryResult<Q>>;
}

export const QueryHandler = BaseQueryHandler;

// @ts-expect-error: Needed to infer result type
export interface QueryBus extends BaseQueryBus {
  execute<Q extends Query<unknown>>(query: Q): Promise<QueryResult<Q>>;
}

export const QueryBus = BaseQueryBus;
