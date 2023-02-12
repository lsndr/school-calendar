import { DateTime } from 'luxon';
import { Client, ClientId } from '../client';
import { Office, OfficeId } from '../office';
import { ExactDate, TimeInterval, TimeZone } from '../shared';
import { DailyRecurrence, WeeklyRecurrence } from './recurrence';
import { RequiredEmployees } from './required-employees';
import { CreateVisit, Visit } from './visit';
import { VisitId } from './visit-id';

describe('Visit', () => {
  describe('doesOccureOn', () => {
    describe('Daily recurrence', () => {
      const { visit, office } = createVisit({
        id: VisitId.create(),
        name: 'Visit',
        recurrence: DailyRecurrence.create(),
        requiredEmployees: RequiredEmployees.create(3),
        time: TimeInterval.create({
          startsAt: 50,
          duration: 200,
        }),
        now: DateTime.fromISO('2023-01-25T09:08:34.123', {
          zone: 'Europe/Moscow',
        }),
      });

      it('should return true for date after visit creation date', () => {
        const result = visit.doesOccureOn(
          ExactDate.create({
            day: 2,
            month: 2,
            year: 2023,
          }),
          office,
        );

        expect(result).toBeTruthy();
      });

      it('should return false for date before visit creation date', () => {
        const result = visit.doesOccureOn(
          ExactDate.create({
            day: 7,
            month: 1,
            year: 2023,
          }),
          office,
        );

        expect(result).toBeFalsy();
      });
    });

    describe('Weekly recurrence', () => {
      const { visit, office } = createVisit({
        id: VisitId.create(),
        name: 'Visit',
        recurrence: WeeklyRecurrence.create([0, 4]),
        requiredEmployees: RequiredEmployees.create(3),
        time: TimeInterval.create({
          startsAt: 50,
          duration: 200,
        }),
        now: DateTime.fromISO('2023-01-25T09:08:34.123', {
          zone: 'Europe/Moscow',
        }),
      });

      it('should return true for next 3 fridays', () => {
        const result1 = visit.doesOccureOn(
          ExactDate.create({
            day: 27,
            month: 1,
            year: 2023,
          }),
          office,
        );
        const result2 = visit.doesOccureOn(
          ExactDate.create({
            day: 3,
            month: 2,
            year: 2023,
          }),
          office,
        );
        const result3 = visit.doesOccureOn(
          ExactDate.create({
            day: 10,
            month: 2,
            year: 2023,
          }),
          office,
        );

        expect(result1).toBeTruthy();
        expect(result2).toBeTruthy();
        expect(result3).toBeTruthy();
      });

      it('should return true for next 3 mondays', () => {
        const result1 = visit.doesOccureOn(
          ExactDate.create({
            day: 30,
            month: 1,
            year: 2023,
          }),
          office,
        );
        const result2 = visit.doesOccureOn(
          ExactDate.create({
            day: 6,
            month: 2,
            year: 2023,
          }),
          office,
        );
        const result3 = visit.doesOccureOn(
          ExactDate.create({
            day: 13,
            month: 2,
            year: 2023,
          }),
          office,
        );

        expect(result1).toBeTruthy();
        expect(result2).toBeTruthy();
        expect(result3).toBeTruthy();
      });

      it('should return false for fridays and mondays before visit creation date', () => {
        const result1 = visit.doesOccureOn(
          ExactDate.create({
            day: 23,
            month: 1,
            year: 2023,
          }),
          office,
        );
        const result2 = visit.doesOccureOn(
          ExactDate.create({
            day: 20,
            month: 1,
            year: 2023,
          }),
          office,
        );

        expect(result1).toBeFalsy();
        expect(result2).toBeFalsy();
      });

      it('should return false for days that are not in the recurrence', () => {
        const result1 = visit.doesOccureOn(
          ExactDate.create({
            day: 26,
            month: 1,
            year: 2023,
          }),
          office,
        );
        const result2 = visit.doesOccureOn(
          ExactDate.create({
            day: 22,
            month: 2,
            year: 2023,
          }),
          office,
        );
        const result3 = visit.doesOccureOn(
          ExactDate.create({
            day: 15,
            month: 1,
            year: 2023,
          }),
          office,
        );

        expect(result1).toBeFalsy();
        expect(result2).toBeFalsy();
        expect(result3).toBeFalsy();
      });
    });
  });
});

function createVisit(data: Omit<CreateVisit, 'office' | 'client'>) {
  const office = Office.create({
    id: OfficeId.create(),
    name: 'Office',
    timeZone: TimeZone.create('Europe/Moscow'),
    now: DateTime.now(),
  });
  const client = Client.create({
    id: ClientId.create(),
    name: 'Client',
    office,
    now: DateTime.now(),
  });
  const visit = Visit.create({
    ...data,
    id: VisitId.create(),
    client,
    name: 'Visit',
    office,
  });

  return { visit, office };
}
