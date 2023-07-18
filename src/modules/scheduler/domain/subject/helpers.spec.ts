import { DateTime } from 'luxon';
import { extractDatesFromPeriodicity } from './helpers';

describe('extractDatesFromPeriodicity', () => {
  it('should properly extract dates from daily periodicity', () => {
    const dates = extractDatesFromPeriodicity(
      DateTime.fromISO('2023-01-25T00:00:00', {
        zone: 'Europe/Moscow',
      }),
      DateTime.fromISO('2023-01-26T00:00:00', {
        zone: 'Europe/Moscow',
      }),
      {
        recurrence: {
          type: 'daily',
        },
        timeZone: 'Europe/Moscow',
        calculateSince: DateTime.fromISO('2023-01-23T00:00:00', {
          zone: 'Europe/Moscow',
        }),
      },
    );

    expect(Array.from(dates)).toEqual([
      DateTime.fromISO('2023-01-25T00:00:00', {
        zone: 'Europe/Moscow',
      }),
    ]);
  });
});
