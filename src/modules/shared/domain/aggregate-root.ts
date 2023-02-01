import { AggregateEvents } from './aggregate-events';

export abstract class AggregateRoot {
  protected _eventsManager = new AggregateEvents();

  get events() {
    return this._eventsManager.events;
  }

  protected constructor() {
    //pass
  }
}
