import { BiWeeklyRecurrence } from './biweekly';
import { DailyRecurrence } from './daily';
import { MonthlyRecurrence } from './monthly';
import { WeeklyRecurrence } from './weekly';

export * from './types';

export type Recurrence =
  | DailyRecurrence
  | WeeklyRecurrence
  | BiWeeklyRecurrence
  | MonthlyRecurrence;

export {
  DailyRecurrence,
  WeeklyRecurrence,
  MonthlyRecurrence,
  BiWeeklyRecurrence,
};
