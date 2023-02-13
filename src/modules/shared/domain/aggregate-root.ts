import { AggregateEvents } from './aggregate-events';
import { DomainObject } from './domain-object';

export abstract class AggregateRoot extends DomainObject {
  private _eventsManager?: AggregateEvents;

  protected get _events() {
    if (!this._eventsManager) {
      this._eventsManager = new AggregateEvents();
    }

    return this._eventsManager;
  }

  protected set _events(em: AggregateEvents) {
    this._eventsManager = em;
  }

  get events() {
    return this._events.events;
  }

  protected constructor() {
    super();
    //pass
  }
}
