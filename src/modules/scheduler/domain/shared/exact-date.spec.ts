import { DomainError } from '@shared/domain';
import { ExactDate } from './exact-date';
import { TimeZone } from './time-zone';

describe('Exact Date', () => {
  it('should fail to create a date with invalid day', () => {
    const act = () =>
      ExactDate.create({
        day: 100,
        month: 1,
        year: 2024,
      });

    expect(act).toThrowError(new DomainError('ExactDate', 'datetime_invalid'));
  });

  it('should fail to create a date with invalid month', () => {
    const act = () =>
      ExactDate.create({
        day: 1,
        month: 13,
        year: 2024,
      });

    expect(act).toThrowError(new DomainError('ExactDate', 'datetime_invalid'));
  });

  it('should fail to create a date with invalid year', () => {
    const act = () =>
      ExactDate.create({
        day: 1,
        month: 1,
        year: -1,
      });

    expect(act).toThrowError(new DomainError('ExactDate', 'datetime_invalid'));
  });

  it('should create a date', () => {
    const date = ExactDate.create({
      day: 1,
      month: 6,
      year: 2023,
    });
    const dateTime = date.toDateTime();

    expect(date.day).toBe(1);
    expect(date.month).toBe(6);
    expect(date.year).toBe(2023);
    expect(dateTime.toISO()).toBe('2023-06-01T00:00:00.000+00:00');
  });

  it('should create a date in America/Rainy_River time zone', () => {
    const date = ExactDate.create({
      day: 1,
      month: 6,
      year: 2023,
    });
    const dateTime = date.toDateTime(TimeZone.create('America/Rainy_River'));

    expect(date.day).toBe(1);
    expect(date.month).toBe(6);
    expect(date.year).toBe(2023);
    expect(dateTime.toUTC().toISO()).toBe('2023-06-01T05:00:00.000Z');
    expect(dateTime.zoneName).toBe('America/Rainy_River');
  });
});
