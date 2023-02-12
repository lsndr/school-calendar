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
        tzid: options.timeZone,
      }),
    );
  } else if (options.recurence.type === 'weekly') {
    rruleSet.rrule(
      new RRule({
        freq: Frequency.WEEKLY,
        dtstart,
        until,
        tzid: options.timeZone,
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
        tzid: options.timeZone,
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
        tzid: options.timeZone,
        byweekday: [...options.recurence.week1],
      }),
    );
  } else if (options.recurence.type === 'monthly') {
    rruleSet.rrule(
      new RRule({
        freq: Frequency.MONTHLY,
        dtstart,
        until,
        tzid: options.timeZone,
        bymonthday: [...options.recurence.days],
      }),
    );
  }

  return rruleSet;
}

function* rruleBetween(rruleSet: RRuleSet, from: DateTime, to: DateTime) {
  const timeZone = rruleSet.tzid();

  const localFrom = from.setZone(timeZone);
  const localTo = to.setZone(timeZone);

  const dates = rruleSet.between(
    localFrom.toJSDate(),
    localTo.toJSDate(),
    true,
  );

  for (const date of dates) {
    if (date.getTime() >= localTo.toMillis()) {
      continue;
    }

    yield DateTime.fromJSDate(date, { zone: timeZone });
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

  return rruleBetween(rruleSet, from, to);
}
