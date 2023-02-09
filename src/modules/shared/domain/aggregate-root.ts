import { AggregateEvents } from './aggregate-events';

export abstract class AggregateRoot {
  private __eventsManager?: AggregateEvents;

  protected get _eventsManager() {
    if (!this.__eventsManager) {
      this.__eventsManager = new AggregateEvents();
    }

    return this.__eventsManager;
  }

  protected set _eventsManager(em: AggregateEvents) {
    this.__eventsManager = em;
  }

  get events() {
    return this._eventsManager.events;
  }

  protected constructor() {
    //pass
  }
}
