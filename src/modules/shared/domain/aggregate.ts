import { AggregateEvents } from './aggregate-events';

export interface AggregateState<I> {
  readonly id: I;
}

export abstract class Aggregate<I, S extends AggregateState<I>> {
  protected readonly state: S;
  protected readonly eventsManager: AggregateEvents;

  get id() {
    return this.state.id;
  }

  get events() {
    return this.eventsManager.events;
  }

  protected constructor(
    state: S,
    eventsManager: AggregateEvents = new AggregateEvents(),
  ) {
    this.state = state;
    this.eventsManager = eventsManager;
  }
}
