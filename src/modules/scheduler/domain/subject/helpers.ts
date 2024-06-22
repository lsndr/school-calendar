import { DateTime } from 'luxon';
import * as RRule from 'rrule-rust';
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

type RecurrenceToRruleSetOptions = {
  recurrence: Recurrence;
  timeZone: string;
  start: DateTime;
  until?: DateTime;
};

function recurrenceToRruleSet(options: RecurrenceToRruleSetOptions) {
  const dtstart = RRule.DateTime.fromObject(
    options.start.setZone(options.timeZone),
  );
  const until =
    options.until &&
    RRule.DateTime.fromObject(options.until.setZone(options.timeZone));

  if (options.recurrence.type === 'daily') {
    return [
      new RRule.RRuleSet({
        dtstart,
        tzid: options.timeZone,
        rrules: [
          new RRule.RRule({
            frequency: RRule.Frequency.Daily,
            until,
          }),
        ],
      }),
    ];
  } else if (options.recurrence.type === 'weekly') {
    return [
      new RRule.RRuleSet({
        dtstart,
        tzid: options.timeZone,
        rrules: [
          new RRule.RRule({
            frequency: RRule.Frequency.Weekly,
            until,
            byWeekday: [...options.recurrence.days],
          }),
        ],
      }),
    ];
  } else if (options.recurrence.type === 'biweekly') {
    return [
      new RRule.RRuleSet({
        dtstart,
        tzid: options.timeZone,
        rrules: [
          new RRule.RRule({
            frequency: RRule.Frequency.Weekly,
            interval: 2,
            until,
            byWeekday: [...options.recurrence.week1],
          }),
        ],
      }),
      new RRule.RRuleSet({
        dtstart: RRule.DateTime.fromObject(
          DateTime.fromObject(dtstart, { zone: options.timeZone }).plus({
            weeks: 1,
          }),
        ),
        tzid: options.timeZone,
        rrules: [
          new RRule.RRule({
            frequency: RRule.Frequency.Weekly,
            interval: 2,
            until,
            byWeekday: [...options.recurrence.week2],
          }),
        ],
      }),
    ];
  } else {
    return [
      new RRule.RRuleSet({
        dtstart,
        tzid: options.timeZone,
        rrules: [
          new RRule.RRule({
            frequency: RRule.Frequency.Monthly,
            until,
            byMonthday: [...options.recurrence.days],
          }),
        ],
      }),
    ];
  }
}

function* rruleBetween(
  rruleSets: RRule.RRuleSet[],
  from: DateTime,
  to: DateTime,
  timeZone: string,
) {
  const localFrom = from.setZone(timeZone);
  const localTo = to.setZone(timeZone);

  for (const rruleSet of rruleSets) {
    const dates = rruleSet.between(
      RRule.DateTime.fromObject(localFrom),
      RRule.DateTime.fromObject(localTo),
      true,
    );

    for (const date of dates) {
      const localDate = DateTime.fromObject(date.toObject(), {
        zone: timeZone,
      });

      if (localDate.toMillis() >= localTo.toMillis()) {
        continue;
      }

      yield DateTime.fromObject(date.toObject(), { zone: timeZone });
    }
  }
}

type ExtractDatesFromRecurrenceOptions = {
  recurrence: Recurrence;
  calculateSince: DateTime;
  calculateTill?: DateTime;
  timeZone: string;
};

export function extractDatesFromRecurrence(
  from: DateTime,
  to: DateTime,
  options: ExtractDatesFromRecurrenceOptions,
) {
  const rruleSets = recurrenceToRruleSet({
    timeZone: options.timeZone,
    start: options.calculateSince,
    until: options.calculateTill,
    recurrence: options.recurrence,
  });

  return rruleBetween(rruleSets, from, to, options.timeZone);
}
