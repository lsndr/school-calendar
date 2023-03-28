import { DateTime } from 'luxon';
import { RRule, RRuleSet, Frequency } from 'rrule-rust';
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

function periodicityToUtcRruleSets(options: PeriodicityToRruleSetOptions) {
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
    const rrule = new RRule(Frequency.Daily);

    if (until) {
      rrule.setUntil(until.getTime());
    }

    const set = new RRuleSet(dtstart.getTime(), 'UTC').addRrule(rrule);

    return [set];
  } else if (options.recurence.type === 'weekly') {
    const rrule = new RRule(Frequency.Weekly).setByWeekday(
      options.recurence.days,
    );

    if (until) {
      rrule.setUntil(until.getTime());
    }

    const set = new RRuleSet(dtstart.getTime(), 'UTC').addRrule(rrule);

    return [set];
  } else if (options.recurence.type === 'biweekly') {
    const rrule1 = new RRule(Frequency.Weekly)
      .setByWeekday(options.recurence.week1)
      .setInterval(2);

    if (until) {
      rrule1.setUntil(until.getTime());
    }

    const set1 = new RRuleSet(dtstart.getTime(), 'UTC').addRrule(rrule1);

    const dtstart2 = new Date(dtstart);
    dtstart2.setDate(dtstart2.getDate() + 7);

    const rrule2 = new RRule(Frequency.Weekly)
      .setByWeekday(options.recurence.week2)
      .setInterval(2);

    if (until) {
      rrule2.setUntil(until.getTime());
    }

    const set2 = new RRuleSet(dtstart2.getTime(), 'UTC').addRrule(rrule2);

    return [set1, set2];
  } else if (options.recurence.type === 'monthly') {
    const rrule = new RRule(Frequency.Monthly).setByWeekday(
      options.recurence.days,
    );

    if (until) {
      rrule.setUntil(until.getTime());
    }

    const set = new RRuleSet(dtstart.getTime(), 'UTC').addRrule(rrule);

    return [set];
  } else {
    throw new Error(`Unexpected recurrence type`);
  }
}

function* rruleBetween(
  rruleSets: RRuleSet[],
  from: DateTime,
  to: DateTime,
  timeZone: string,
) {
  for (const rruleSet of rruleSets) {
    const utcFrom = from.setZone('UTC', { keepLocalTime: true }).toMillis();
    const utcTo = to.setZone('UTC', { keepLocalTime: true }).toMillis();

    const dates = rruleSet.between(utcFrom, utcTo, true);

    for (const date of dates) {
      if (date >= utcTo) {
        continue;
      }

      yield DateTime.fromMillis(date).setZone(timeZone, {
        keepLocalTime: true,
      });
    }
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
  const rruleSet = periodicityToUtcRruleSets({
    timeZone: options.timeZone,
    start: options.calculateSince,
    until: options.calculateTill,
    recurence: options.recurence,
  });

  return rruleBetween(rruleSet, from, to, options.timeZone);
}
