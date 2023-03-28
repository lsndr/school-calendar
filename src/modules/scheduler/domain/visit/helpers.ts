import { DateTime } from 'luxon';
import { RRule, RRuleSet, Frequency } from 'rrule';
import { MonthDays, WeekDays } from './recurrence';

type Recurrence =
  | {
      type: 'daily';
    }
  | {
      type: 'weekly';
      days: ReadonlyArray<(typeof WeekDays)[number]>;
    }
  | {
      type: 'biweekly';
      week1: ReadonlyArray<(typeof WeekDays)[number]>;
      week2: ReadonlyArray<(typeof WeekDays)[number]>;
    }
  | {
      type: 'monthly';
      days: ReadonlyArray<(typeof MonthDays)[number]>;
    };

type PeriodicityToRruleSetOptions = {
  recurence: Recurrence;
  timeZone: string;
  start: DateTime;
  until?: DateTime;
};

function periodicityToRruleSet(options: PeriodicityToRruleSetOptions) {
  const rruleSet = new RRuleSet();

  const localStart = options.start.setZone(options.timeZone);
  const dtstart = new Date(
    Date.UTC(
      localStart.year,
      localStart.month - 1,
      localStart.day,
      localStart.hour,
      localStart.minute,
      localStart.second,
    ),
  );

  const localUntill = options.until?.setZone(options.timeZone);
  const until =
    localUntill &&
    new Date(
      Date.UTC(
        localUntill.year,
        localUntill.month - 1,
        localUntill.day,
        localUntill.hour,
        localUntill.minute,
        localUntill.second,
      ),
    );

  if (options.recurence.type === 'daily') {
    rruleSet.rrule(
      new RRule({
        freq: Frequency.DAILY,
        dtstart,
        until,
        tzid: 'UTC',
      }),
    );
  } else if (options.recurence.type === 'weekly') {
    rruleSet.rrule(
      new RRule({
        freq: Frequency.WEEKLY,
        dtstart,
        until,
        tzid: 'UTC',
        byweekday: [...options.recurence.days],
      }),
    );
  } else if (options.recurence.type === 'biweekly') {
    rruleSet.rrule(
      new RRule({
        freq: Frequency.WEEKLY,
        interval: 2,
        dtstart,
        until,
        tzid: 'UTC',
        byweekday: [...options.recurence.week1],
      }),
    );

    const dtstart2 = new Date(dtstart);
    dtstart2.setDate(dtstart2.getDate() + 7);

    rruleSet.rrule(
      new RRule({
        freq: Frequency.WEEKLY,
        interval: 2,
        dtstart: dtstart2,
        until,
        tzid: 'UTC',
        byweekday: [...options.recurence.week1],
      }),
    );
  } else if (options.recurence.type === 'monthly') {
    rruleSet.rrule(
      new RRule({
        freq: Frequency.MONTHLY,
        dtstart,
        until,
        tzid: 'UTC',
        bymonthday: [...options.recurence.days],
      }),
    );
  }

  return rruleSet;
}

function* rruleBetween(
  rruleSet: RRuleSet,
  from: DateTime,
  to: DateTime,
  timeZone: string,
) {
  const localFrom = from.setZone(timeZone);
  const localTo = to.setZone(timeZone);

  const dateFrom = new Date(
    Date.UTC(
      localFrom.year,
      localFrom.month - 1,
      localFrom.day,
      localFrom.hour,
      localFrom.minute,
      localFrom.second,
    ),
  );

  const dateTo = new Date(
    Date.UTC(
      localTo.year,
      localTo.month - 1,
      localTo.day,
      localTo.hour,
      localTo.minute,
      localTo.second,
    ),
  );

  const dates = rruleSet.between(dateFrom, dateTo, true);

  for (const date of dates) {
    if (date.getTime() >= localTo.toMillis()) {
      continue;
    }

    yield DateTime.fromJSDate(date).setZone(timeZone, { keepLocalTime: true });
  }
}

type ExtractDatesFromPeriodicityOptions = {
  recurence: Recurrence;
  calculateSince: DateTime;
  calculateTill?: DateTime;
  timeZone: string;
};

export function extractDatesFromPeriodicity(
  from: DateTime,
  to: DateTime,
  options: ExtractDatesFromPeriodicityOptions,
) {
  const rruleSet = periodicityToRruleSet({
    timeZone: options.timeZone,
    start: options.calculateSince,
    until: options.calculateTill,
    recurence: options.recurence,
  });

  return rruleBetween(rruleSet, from, to, options.timeZone);
}
