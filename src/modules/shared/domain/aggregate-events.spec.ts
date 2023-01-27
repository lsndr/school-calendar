import { AggregateEvents } from './aggregate-events';

class TestEvent {
  param: string;

  constructor(param: string) {
    this.param = param;
  }
}

class TestEvent2 {
  param2: string;

  constructor(param: string) {
    this.param2 = param;
  }
}

describe('Aggregate Events', () => {
  let eventsManager: AggregateEvents;

  beforeEach(() => {
    eventsManager = new AggregateEvents();
  });

  it('should add an event', () => {
    const event = new TestEvent('value 1');

    eventsManager.add(event);

    expect(eventsManager.events.length).toBe(1);
    expect(eventsManager.events[0]).toBe(event);
  });

  it('should fail to add null', () => {
    const act = () => eventsManager.add(null);

    expect(act).toThrowError('Event must be an object: null provided');
  });

  it('should fail to add string', () => {
    const act = () => eventsManager.add('some string');

    expect(act).toThrowError('Event must be an object: some string provided');
  });

  it('should fail to add number', () => {
    const act = () => eventsManager.add(1);

    expect(act).toThrowError('Event must be an object: 1 provided');
  });

  it('should add an array of events', () => {
    const event1 = new TestEvent('value 1');
    const event2 = new TestEvent('value 2');

    eventsManager.add([event1, event2]);

    expect(eventsManager.events.length).toBe(2);
    expect(eventsManager.events[0]).toBe(event1);
    expect(eventsManager.events[1]).toBe(event2);
  });

  it('should replace an event', () => {
    const event1 = new TestEvent('value 1');
    const event2 = new TestEvent2('value 2');

    eventsManager.add(event1);
    eventsManager.add(event2);

    const event3 = new TestEvent('value 4');

    const affected = eventsManager.replace((event) => {
      if (event instanceof TestEvent) {
        return event3;
      }

      return event;
    });

    expect(eventsManager.events.length).toBe(2);
    expect(eventsManager.events[0]).toBe(event3);
    expect(eventsManager.events[1]).toBe(event2);
    expect(affected).toBe(1);
  });

  it('should replace an instance of TestEvent2', () => {
    const event1 = new TestEvent('value 1');
    const event2 = new TestEvent2('value 2');

    eventsManager.add(event1);
    eventsManager.add(event2);

    const event3 = new TestEvent('value 4');

    eventsManager.replaceInstanceOrAdd(TestEvent2, event3);

    expect(eventsManager.events.length).toBe(2);
    expect(eventsManager.events[0]).toBe(event1);
    expect(eventsManager.events[1]).toBe(event3);
  });

  it('should add an event if instance of TestEvent2 not found', () => {
    const event1 = new TestEvent('value 1');
    const event2 = new TestEvent('value 2');

    eventsManager.add(event1);
    eventsManager.add(event2);

    const event3 = new TestEvent2('value 3');

    eventsManager.replaceInstanceOrAdd(TestEvent2, event3);

    expect(eventsManager.events.length).toBe(3);
    expect(eventsManager.events[0]).toBe(event1);
    expect(eventsManager.events[1]).toBe(event2);
    expect(eventsManager.events[2]).toBe(event3);
  });
});
