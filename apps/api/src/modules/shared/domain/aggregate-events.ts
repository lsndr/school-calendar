export class AggregateEvents {
  #events: Record<any, any>[];

  public get events(): readonly Readonly<Record<any, any>>[] {
    return this.#events;
  }

  public constructor() {
    this.#events = [];
  }

  public add(event: unknown): void {
    const events = Array.isArray(event) ? event : [event];

    for (const e of events) {
      if (typeof event !== 'object' || event === null) {
        throw new Error(`Event must be an object: ${String(event)} provided`);
      }

      this.#events.push(e);
    }
  }

  public replace(replacer: (event: unknown) => unknown): number {
    let affected = 0;

    this.#events = this.#events.reduce<Record<any, any>[]>((events, event) => {
      const reducedEvent = replacer(event);

      if (typeof reducedEvent === 'object' && reducedEvent !== null) {
        const reducedEvents = Array.isArray(reducedEvent)
          ? reducedEvent
          : [reducedEvent];

        for (const e of reducedEvents) {
          events.push(e);
        }
      }

      if (reducedEvent !== event) {
        affected++;
      }

      return events;
    }, []);

    return affected;
  }

  public replaceInstanceOrAdd(
    ctor: new (...args: any[]) => unknown,
    newEvent: unknown,
  ): void {
    const replaced = this.replace((event) => {
      if (event instanceof ctor) {
        return newEvent;
      }

      return event;
    });

    if (replaced === 0) {
      this.add(newEvent);
    }
  }

  // TODO: find and replace
  // TODO: remove event
}
