import {
  BiWeeklyPeriodicity,
  DailyPeriodicity,
  MonthlyPeriodicity,
  WeeklyPeriodicity,
} from '../../domain';
import { BiWeeklyPeriodicityHydartor } from './biweekly-peridoicity.hydrator';
import { MonthlyPeriodicityHydartor } from './monthly-peridoicity.hydrator';
import { WeeklyPeriodicityHydartor } from './weekly-peridoicity.hydrator';

export function mapRawToPeriodicity(type: any, data: any) {
  if (type === 'daily') {
    return DailyPeriodicity.create();
  } else if (type === 'weekly') {
    return new WeeklyPeriodicityHydartor(data.days);
  } else if (type === 'biweekly') {
    return new BiWeeklyPeriodicityHydartor(data);
  } else if (type === 'monthly') {
    return new MonthlyPeriodicityHydartor(data.days);
  } else {
    throw new Error('Unknown periodicity type');
  }
}

export function mapPeriodicityToRaw(
  peridoicity:
    | DailyPeriodicity
    | WeeklyPeriodicity
    | BiWeeklyPeriodicity
    | MonthlyPeriodicity,
) {
  if (peridoicity.type === 'daily') {
    return DailyPeriodicity.create();
  } else if (peridoicity.type === 'weekly') {
    return {
      days: peridoicity.days,
    };
  } else if (peridoicity.type === 'biweekly') {
    return {
      week1: peridoicity.week1,
      week2: peridoicity.week2,
    };
  } else if (peridoicity.type === 'monthly') {
    return {
      days: peridoicity.days,
    };
  } else {
    throw new Error('Unknown periodicity type');
  }
}
