import {
  BiWeeklyPeriodicity,
  DailyPeriodicity,
  MonthlyPeriodicity,
  WeeklyPeriodicity,
} from '../../domain';
import { BiWeeklyPeriodicityDto } from './biweekly-periodicity.dto';
import { DailyPeriodicityDto } from './daily-periodicity.dto';
import { MonthlyPeriodicityDto } from './monthly-periodicity.dto';
import { WeeklyPeriodicityDto } from './weekly-periodicity.dto';

export function mapPeriodicityToDto(dto: DailyPeriodicity): DailyPeriodicityDto;
export function mapPeriodicityToDto(
  peridoicity: WeeklyPeriodicity,
): WeeklyPeriodicityDto;
export function mapPeriodicityToDto(
  peridoicity: BiWeeklyPeriodicity,
): BiWeeklyPeriodicityDto;
export function mapPeriodicityToDto(
  peridoicity: MonthlyPeriodicity,
): MonthlyPeriodicityDto;
export function mapPeriodicityToDto(
  peridoicity:
    | DailyPeriodicity
    | WeeklyPeriodicity
    | BiWeeklyPeriodicity
    | MonthlyPeriodicity,
):
  | DailyPeriodicityDto
  | WeeklyPeriodicityDto
  | BiWeeklyPeriodicityDto
  | MonthlyPeriodicityDto;
export function mapPeriodicityToDto(
  peridoicity:
    | DailyPeriodicity
    | WeeklyPeriodicity
    | BiWeeklyPeriodicity
    | MonthlyPeriodicity,
) {
  if (peridoicity.type === 'daily') {
    return new DailyPeriodicityDto();
  } else if (peridoicity.type === 'weekly') {
    return new WeeklyPeriodicityDto({
      days: Array.from(peridoicity.days),
    });
  } else if (peridoicity.type === 'biweekly') {
    return new BiWeeklyPeriodicityDto({
      week1: Array.from(peridoicity.week1),
      week2: Array.from(peridoicity.week2),
    });
  } else if (peridoicity.type === 'monthly') {
    return new MonthlyPeriodicityDto({
      days: Array.from(peridoicity.days),
    });
  } else {
    throw new Error('Unknown periodicity type');
  }
}

export function mapDtoToPeriodicity(dto: DailyPeriodicityDto): DailyPeriodicity;
export function mapDtoToPeriodicity(
  dto: WeeklyPeriodicityDto,
): WeeklyPeriodicity;
export function mapDtoToPeriodicity(
  dto: BiWeeklyPeriodicityDto,
): BiWeeklyPeriodicity;
export function mapDtoToPeriodicity(
  dto: MonthlyPeriodicityDto,
): MonthlyPeriodicity;
export function mapDtoToPeriodicity(
  dto:
    | DailyPeriodicityDto
    | WeeklyPeriodicityDto
    | BiWeeklyPeriodicityDto
    | MonthlyPeriodicityDto,
):
  | DailyPeriodicity
  | MonthlyPeriodicity
  | WeeklyPeriodicity
  | BiWeeklyPeriodicity;
export function mapDtoToPeriodicity(
  dto:
    | DailyPeriodicityDto
    | WeeklyPeriodicityDto
    | BiWeeklyPeriodicityDto
    | MonthlyPeriodicityDto,
) {
  if (dto.type === 'daily') {
    return DailyPeriodicity.create();
  } else if (dto.type === 'weekly') {
    return WeeklyPeriodicity.create(dto.days);
  } else if (dto.type === 'biweekly') {
    return BiWeeklyPeriodicity.create({
      week1: dto.week1,
      week2: dto.week2,
    });
  } else if (dto.type === 'monthly') {
    return MonthlyPeriodicity.create(dto.days);
  } else {
    throw new Error('Unknown periodicity type');
  }
}

export function mapRawPeriodicityToDto(type: any, data: any) {
  if (type === 'daily') {
    return new DailyPeriodicityDto();
  } else if (type === 'weekly') {
    return new WeeklyPeriodicityDto(data);
  } else if (type === 'biweekly') {
    return new BiWeeklyPeriodicityDto(data);
  } else if (type === 'monthly') {
    return new MonthlyPeriodicityDto(data);
  } else {
    throw new Error('Unknown periodicity type');
  }
}
