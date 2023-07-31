import {
  CommandHandler as BaseCommandHandler,
  CommandBus as BaseCommandBus,
} from '@nestjs/cqrs';

export class Command<R = void> {
  // @ts-expect-error -- Needed for inference
  private __resultType: R;
}

export type CommandProps<T extends Command<unknown>> = {
  readonly [P in keyof T]: T[P];
};

export type CommandPayload<C> = C & { __resultType: any };

export type CommandResult<Q extends Command<unknown>> = Q extends Command<
  infer R
>
  ? R
  : never;

export interface CommandHandler<Q extends Command<unknown>> {
  execute(query: Q): Promise<CommandResult<Q>>;
}

export const CommandHandler = BaseCommandHandler;

// @ts-expect-error: Needed to infer result type
export interface CommandBus extends BaseCommandBus {
  execute<Q extends Command<unknown>>(query: Q): Promise<CommandResult<Q>>;
}

export const CommandBus = BaseCommandBus;
