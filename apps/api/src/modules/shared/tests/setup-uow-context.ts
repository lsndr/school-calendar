import { UowContext, type Uow } from 'yuow/core';
import { type CommandBus, type QueryBus } from '../cqrs';

export function setupUowContext(
  buses: { commandBus?: CommandBus; queryBus?: QueryBus },
  uow: Uow<any>,
): void {
  if (buses.commandBus) {
    const bus = buses.commandBus;
    const original = bus.execute.bind(bus);
    (bus as any).execute = (command: any) =>
      UowContext.create(uow, () => original(command));
  }

  if (buses.queryBus) {
    const bus = buses.queryBus;
    const original = bus.execute.bind(bus);
    (bus as any).execute = (query: any) =>
      UowContext.create(uow, () => original(query));
  }
}
