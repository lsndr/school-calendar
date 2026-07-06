import { DateTime } from 'luxon';
import * as rrule from 'rrule-rust';
import { type MonthDays, type WeekDays } from './recurrence';

type Recurrence =
  | {
      type: 'daily';
    }
  | {
      type: 'weekly';
      days: readonly (typeof WeekDays)[number][];
    }
  | {
      type: 'biweekly';
      week1: readonly (typeof WeekDays)[number][];
      week2: readonly (typeof WeekDays)[number][];
    }
  | {
      type: 'monthly';
      days: readonly (typeof MonthDays)[number][];
    };

interface RecurrenceToRruleSetOptions {
  recurrence: Recurrence;
  timeZone: string;
  start: DateTime;
  until?: DateTime;
}

function recurrenceToRruleSet(options: RecurrenceToRruleSetOptions) {
  const dtstart = new rrule.DtStart(
    rrule.DateTime.fromPlain(options.start.setZone(options.timeZone)),
    options.timeZone,
  );
  const until =
    options.until &&
    rrule.DateTime.fromPlain(options.until.setZone(options.timeZone));

  if (options.recurrence.type === 'daily') {
    return [
      new rrule.RRuleSet({
        dtstart,
        rrules: [
          new rrule.RRule({
            frequency: rrule.Frequency.Daily,
            until,
          }),
        ],
      }),
    ];
  } else if (options.recurrence.type === 'weekly') {
    return [
      new rrule.RRuleSet({
        dtstart,
        rrules: [
          new rrule.RRule({
            frequency: rrule.Frequency.Weekly,
            until,
            byWeekday: [...options.recurrence.days],
          }),
        ],
      }),
    ];
  } else if (options.recurrence.type === 'biweekly') {
    return [
      new rrule.RRuleSet({
        dtstart,
        rrules: [
          new rrule.RRule({
            frequency: rrule.Frequency.Weekly,
            interval: 2,
            until,
            byWeekday: [...options.recurrence.week1],
          }),
        ],
      }),
      new rrule.RRuleSet({
        dtstart: dtstart.setValue(
          rrule.DateTime.fromPlain(
            options.start.setZone(options.timeZone).plus({ weeks: 1 }),
          ),
        ),
        rrules: [
          new rrule.RRule({
            frequency: rrule.Frequency.Weekly,
            interval: 2,
            until,
            byWeekday: [...options.recurrence.week2],
          }),
        ],
      }),
    ];
  } else {
    return [
      new rrule.RRuleSet({
        dtstart,
        rrules: [
          new rrule.RRule({
            frequency: rrule.Frequency.Monthly,
            until,
            byMonthday: [...options.recurrence.days],
          }),
        ],
      }),
    ];
  }
}

function* rruleBetween(
  rruleSets: rrule.RRuleSet<rrule.DateTime<rrule.Time>>[],
  from: DateTime,
  to: DateTime,
  timeZone: string,
) {
  const localFrom = from.setZone(timeZone);
  const localTo = to.setZone(timeZone);

  for (const rruleSet of rruleSets) {
    const dates = rruleSet.between(
      rrule.DateTime.fromPlain(localFrom),
      rrule.DateTime.fromPlain(localTo),
      true,
    );

    for (const date of dates) {
      const localDate = DateTime.fromObject(
        date.toPlain({
          stripUtc: true,
        }),
        {
          zone: timeZone,
        },
      );

      if (localDate.toMillis() >= localTo.toMillis()) {
        continue;
      }

      yield DateTime.fromObject(date.toPlain({ stripUtc: true }), {
        zone: timeZone,
      });
    }
  }
}

interface ExtractDatesFromRecurrenceOptions {
  recurrence: Recurrence;
  calculateSince: DateTime;
  calculateTill?: DateTime;
  timeZone: string;
}

export function extractDatesFromRecurrence(
  from: DateTime,
  to: DateTime,
  options: ExtractDatesFromRecurrenceOptions,
): Generator<DateTime, void, unknown> {
  const rruleSets = recurrenceToRruleSet({
    timeZone: options.timeZone,
    start: options.calculateSince,
    until: options.calculateTill,
    recurrence: options.recurrence,
  });

  return rruleBetween(rruleSets, from, to, options.timeZone);
}
