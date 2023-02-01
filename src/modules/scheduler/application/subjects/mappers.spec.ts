import {
  DailyRecurrence,
  WeeklyRecurrence,
  BiWeeklyRecurrence,
  MonthlyRecurrence,
} from '../../domain';
import { DailyRecurrenceDto } from './daily-recurrence.dto';
import { WeeklyRecurrenceDto } from './weekly-recurrence.dto';
import { BiWeeklyRecurrenceDto } from './biweekly-recurrence.dto';
import { MonthlyRecurrenceDto } from './monthly-recurrence.dto';
import { mapRecurrenceToDto, mapDtoToRecurrence } from './mappers';

describe('Mappers', () => {
  describe('mapRecurrenceToDto', () => {
    it('should map DailyRecurrence to DailyRecurrenceDto', () => {
      const recurrence = DailyRecurrence.create();
      const dto = mapRecurrenceToDto(recurrence);

      expect(dto).toBeInstanceOf(DailyRecurrenceDto);
      expect(dto).toEqual({
        type: 'daily',
      });
    });

    it('should map WeeklyRecurrence to WeeklyRecurrenceDto', () => {
      const peridoicity = WeeklyRecurrence.create([0, 4, 6]);
      const dto = mapRecurrenceToDto(peridoicity);

      expect(dto).toBeInstanceOf(WeeklyRecurrenceDto);
      expect(dto).toEqual({
        type: 'weekly',
        days: [0, 4, 6],
      });
    });

    it('should map BiWeeklyRecurrence to BiWeeklyRecurrenceDto', () => {
      const peridoicity = BiWeeklyRecurrence.create({
        week1: [0, 4, 6],
        week2: [3, 2, 6],
      });
      const dto = mapRecurrenceToDto(peridoicity);

      expect(dto).toBeInstanceOf(BiWeeklyRecurrenceDto);
      expect(dto).toEqual({
        type: 'biweekly',
        week1: [0, 4, 6],
        week2: [3, 2, 6],
      });
    });

    it('should map MonthlyRecurrence to MonthlyRecurrenceDto', () => {
      const peridoicity = MonthlyRecurrence.create([0, 10, 30]);
      const dto = mapRecurrenceToDto(peridoicity);

      expect(dto).toBeInstanceOf(MonthlyRecurrenceDto);
      expect(dto).toEqual({
        type: 'monthly',
        days: [0, 10, 30],
      });
    });
  });

  describe('mapDtoToRecurrence', () => {
    it('should map DailyRecurrenceDto to DailyRecurrence', () => {
      const dto = new DailyRecurrenceDto();
      const precurrence = mapDtoToRecurrence(dto);

      expect(precurrence).toBeInstanceOf(DailyRecurrence);
      expect(precurrence.type).toBe('daily');
    });

    it('should map WeeklyRecurrenceDto to WeeklyRecurrence', () => {
      const dto = new WeeklyRecurrenceDto({
        days: [0, 1, 2],
      });
      const precurrence = mapDtoToRecurrence(dto);

      expect(precurrence).toBeInstanceOf(WeeklyRecurrence);
      expect(precurrence.type).toBe('weekly');
      expect(Array.from(precurrence.days)).toEqual([0, 1, 2]);
    });

    it('should map WeeklyRecurrenceDto to WeeklyRecurrence', () => {
      const dto = new BiWeeklyRecurrenceDto({
        week1: [0, 1, 2],
        week2: [3, 1, 6],
      });
      const precurrence = mapDtoToRecurrence(dto);

      expect(precurrence).toBeInstanceOf(BiWeeklyRecurrence);
      expect(precurrence.type).toBe('biweekly');
      expect(Array.from(precurrence.week1)).toEqual([0, 1, 2]);
      expect(Array.from(precurrence.week2)).toEqual([3, 1, 6]);
    });

    it('should map MonthlyRecurrenceDto to MonthlyRecurrence', () => {
      const dto = new MonthlyRecurrenceDto({
        days: [0, 26, 30],
      });
      const precurrence = mapDtoToRecurrence(dto);

      expect(precurrence).toBeInstanceOf(MonthlyRecurrence);
      expect(precurrence.type).toBe('monthly');
      expect(Array.from(precurrence.days)).toEqual([0, 26, 30]);
    });
  });
});
