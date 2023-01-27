import {
  BiWeeklyPeriodicity,
  DailyPeriodicity,
  MonthlyPeriodicity,
  WeeklyPeriodicity,
} from '../../domain';
import { BiWeeklyPeriodicityDto } from './biweekly-periodicity.dto';
import { DailyPeriodicityDto } from './daily-periodicity.dto';
import { mapDtoToPeriodicity, mapPeriodicityToDto } from './mappers';
import { MonthlyPeriodicityDto } from './monthly-periodicity.dto';
import { WeeklyPeriodicityDto } from './weekly-periodicity.dto';

describe('Mappers', () => {
  describe('mapPeriodicityToDto', () => {
    it('should map DailyPeriodicity to DailyPeriodicityDto', () => {
      const peridoicity = DailyPeriodicity.create();
      const dto = mapPeriodicityToDto(peridoicity);

      expect(dto).toBeInstanceOf(DailyPeriodicityDto);
      expect(dto).toEqual({
        type: 'daily',
      });
    });

    it('should map WeeklyPeriodicity to WeeklyPeriodicityDto', () => {
      const peridoicity = WeeklyPeriodicity.create([0, 4, 6]);
      const dto = mapPeriodicityToDto(peridoicity);

      expect(dto).toBeInstanceOf(WeeklyPeriodicityDto);
      expect(dto).toEqual({
        type: 'weekly',
        days: [0, 4, 6],
      });
    });

    it('should map BiWeeklyPeriodicity to BiWeeklyPeriodicityDto', () => {
      const peridoicity = BiWeeklyPeriodicity.create({
        week1: [0, 4, 6],
        week2: [3, 2, 6],
      });
      const dto = mapPeriodicityToDto(peridoicity);

      expect(dto).toBeInstanceOf(BiWeeklyPeriodicityDto);
      expect(dto).toEqual({
        type: 'biweekly',
        week1: [0, 4, 6],
        week2: [3, 2, 6],
      });
    });

    it('should map MonthlyPeriodicity to MonthlyPeriodicityDto', () => {
      const peridoicity = MonthlyPeriodicity.create([0, 10, 30]);
      const dto = mapPeriodicityToDto(peridoicity);

      expect(dto).toBeInstanceOf(MonthlyPeriodicityDto);
      expect(dto).toEqual({
        type: 'monthly',
        days: [0, 10, 30],
      });
    });
  });

  describe('mapDtoToPeriodicity', () => {
    it('should map DailyPeriodicityDto to DailyPeriodicity', () => {
      const dto = new DailyPeriodicityDto();
      const periodicity = mapDtoToPeriodicity(dto);

      expect(periodicity).toBeInstanceOf(DailyPeriodicity);
      expect(periodicity.type).toBe('daily');
    });

    it('should map WeeklyPeriodicityDto to WeeklyPeriodicity', () => {
      const dto = new WeeklyPeriodicityDto({
        days: [0, 1, 2],
      });
      const periodicity = mapDtoToPeriodicity(dto);

      expect(periodicity).toBeInstanceOf(WeeklyPeriodicity);
      expect(periodicity.type).toBe('weekly');
      expect(Array.from(periodicity.days)).toEqual([0, 1, 2]);
    });

    it('should map WeeklyPeriodicityDto to WeeklyPeriodicity', () => {
      const dto = new BiWeeklyPeriodicityDto({
        week1: [0, 1, 2],
        week2: [3, 1, 6],
      });
      const periodicity = mapDtoToPeriodicity(dto);

      expect(periodicity).toBeInstanceOf(BiWeeklyPeriodicity);
      expect(periodicity.type).toBe('biweekly');
      expect(Array.from(periodicity.week1)).toEqual([0, 1, 2]);
      expect(Array.from(periodicity.week2)).toEqual([3, 1, 6]);
    });

    it('should map MonthlyPeriodicityDto to MonthlyPeriodicity', () => {
      const dto = new MonthlyPeriodicityDto({
        days: [0, 26, 30],
      });
      const periodicity = mapDtoToPeriodicity(dto);

      expect(periodicity).toBeInstanceOf(MonthlyPeriodicity);
      expect(periodicity.type).toBe('monthly');
      expect(Array.from(periodicity.days)).toEqual([0, 26, 30]);
    });
  });
});
