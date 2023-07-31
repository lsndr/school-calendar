import {
  BiWeeklyRecurrence,
  DailyRecurrence,
  MonthlyRecurrence,
  RecurrenceType,
  WeeklyRecurrence,
} from '../../../domain';
import { BiWeeklyRecurrenceDto } from './../dtos/biweekly-recurrence.dto';
import { DailyRecurrenceDto } from './../dtos/daily-recurrence.dto';
import { MonthlyRecurrenceDto } from './../dtos/monthly-recurrence.dto';
import { WeeklyRecurrenceDto } from './../dtos/weekly-recurrence.dto';

export function mapRecurrenceToDto(
  recurrence: DailyRecurrence,
): DailyRecurrenceDto;
export function mapRecurrenceToDto(
  recurrence: WeeklyRecurrence,
): WeeklyRecurrenceDto;
export function mapRecurrenceToDto(
  recurrence: BiWeeklyRecurrence,
): BiWeeklyRecurrenceDto;
export function mapRecurrenceToDto(
  recurrence: MonthlyRecurrence,
): MonthlyRecurrenceDto;
export function mapRecurrenceToDto(
  recurrence:
    | DailyRecurrence
    | WeeklyRecurrence
    | BiWeeklyRecurrence
    | MonthlyRecurrence,
):
  | DailyRecurrenceDto
  | WeeklyRecurrenceDto
  | BiWeeklyRecurrenceDto
  | MonthlyRecurrenceDto;
export function mapRecurrenceToDto(
  recurrence:
    | DailyRecurrence
    | WeeklyRecurrence
    | BiWeeklyRecurrence
    | MonthlyRecurrence,
) {
  if (recurrence.type === RecurrenceType.Daily) {
    return new DailyRecurrenceDto();
  } else if (recurrence.type === RecurrenceType.Weekly) {
    return new WeeklyRecurrenceDto({
      days: Array.from(recurrence.days),
    });
  } else if (recurrence.type === 'biweekly') {
    return new BiWeeklyRecurrenceDto({
      week1: [...recurrence.week1],
      week2: [...recurrence.week2],
    });
  } else if (recurrence.type === 'monthly') {
    return new MonthlyRecurrenceDto({
      days: Array.from(recurrence.days),
    });
  } else {
    throw new Error('Unknown recurrence type');
  }
}

export function mapDtoToRecurrence(dto: DailyRecurrenceDto): DailyRecurrence;
export function mapDtoToRecurrence(dto: WeeklyRecurrenceDto): WeeklyRecurrence;
export function mapDtoToRecurrence(
  dto: BiWeeklyRecurrenceDto,
): BiWeeklyRecurrence;
export function mapDtoToRecurrence(
  dto: MonthlyRecurrenceDto,
): MonthlyRecurrence;
export function mapDtoToRecurrence(
  dto:
    | DailyRecurrenceDto
    | WeeklyRecurrenceDto
    | BiWeeklyRecurrenceDto
    | MonthlyRecurrenceDto,
): DailyRecurrence | MonthlyRecurrence | WeeklyRecurrence | BiWeeklyRecurrence;
export function mapDtoToRecurrence(
  dto:
    | DailyRecurrenceDto
    | WeeklyRecurrenceDto
    | BiWeeklyRecurrenceDto
    | MonthlyRecurrenceDto,
) {
  if (dto.type === 'daily') {
    return DailyRecurrence.create();
  } else if (dto.type === 'weekly') {
    return WeeklyRecurrence.create(dto.days);
  } else if (dto.type === 'biweekly') {
    return BiWeeklyRecurrence.create({
      week1: dto.week1,
      week2: dto.week2,
    });
  } else if (dto.type === 'monthly') {
    return MonthlyRecurrence.create(dto.days);
  } else {
    throw new Error('Unknown recurrence type');
  }
}

export function mapRawRecurrenceToDto(type: any, data: any) {
  if (type === 'daily') {
    return new DailyRecurrenceDto();
  } else if (type === 'weekly') {
    return new WeeklyRecurrenceDto(data);
  } else if (type === 'biweekly') {
    return new BiWeeklyRecurrenceDto(data);
  } else if (type === 'monthly') {
    return new MonthlyRecurrenceDto(data);
  } else {
    throw new Error('Unknown recurrence type');
  }
}
