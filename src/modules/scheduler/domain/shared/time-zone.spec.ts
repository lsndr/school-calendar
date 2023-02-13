import { DomainError } from '../../../shared/domain';
import { TimeZone } from './time-zone';

describe('Time Zone', () => {
  it('should create America/New_York timezone', () => {
    const timeZone = TimeZone.create('America/New_York');

    expect(timeZone.value).toBe('America/New_York');
  });

  it('should create Europe/Moscow timezone', () => {
    const timeZone = TimeZone.create('Europe/Moscow');

    expect(timeZone.value).toBe('Europe/Moscow');
  });

  it('should create Invalid timezone', () => {
    const act = () => TimeZone.create('Invalid');

    expect(act).toThrow(new DomainError('TimeZone', 'tz_invalid'));
  });
});
