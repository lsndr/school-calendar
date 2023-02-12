import { DateTime } from 'luxon';
import { Group, GroupId } from '../group';
import { School, SchoolId } from '../school';
import { ExactDate, TimeInterval, TimeZone } from '../shared';
import { DailyRecurrence, WeeklyRecurrence } from './recurrence';
import { RequiredTeachers } from './required-teachers';
import { CreateSubject, Subject } from './subject';
import { SubjectId } from './subject-id';

describe('Subject', () => {
  describe('doesOccureOn', () => {
    describe('Daily recurrence', () => {
      const { subject, school } = createSubject({
        id: SubjectId.create(),
        name: 'Subject',
        recurrence: DailyRecurrence.create(),
        requiredTeachers: RequiredTeachers.create(3),
        time: TimeInterval.create({
          startsAt: 50,
          duration: 200,
        }),
        now: DateTime.fromISO('2023-01-25T09:08:34.123', {
          zone: 'Europe/Moscow',
        }),
      });

      it('should return true for date after subject creation date', () => {
        const result = subject.doesOccureOn(
          ExactDate.create({
            day: 2,
            month: 2,
            year: 2023,
          }),
          school,
        );

        expect(result).toBeTruthy();
      });

      it('should return false for date before subject creation date', () => {
        const result = subject.doesOccureOn(
          ExactDate.create({
            day: 7,
            month: 1,
            year: 2023,
          }),
          school,
        );

        expect(result).toBeFalsy();
      });
    });

    describe('Weekly recurrence', () => {
      const { subject, school } = createSubject({
        id: SubjectId.create(),
        name: 'Subject',
        recurrence: WeeklyRecurrence.create([0, 4]),
        requiredTeachers: RequiredTeachers.create(3),
        time: TimeInterval.create({
          startsAt: 50,
          duration: 200,
        }),
        now: DateTime.fromISO('2023-01-25T09:08:34.123', {
          zone: 'Europe/Moscow',
        }),
      });

      it('should return true for next 3 fridays', () => {
        const result1 = subject.doesOccureOn(
          ExactDate.create({
            day: 27,
            month: 1,
            year: 2023,
          }),
          school,
        );
        const result2 = subject.doesOccureOn(
          ExactDate.create({
            day: 3,
            month: 2,
            year: 2023,
          }),
          school,
        );
        const result3 = subject.doesOccureOn(
          ExactDate.create({
            day: 10,
            month: 2,
            year: 2023,
          }),
          school,
        );

        expect(result1).toBeTruthy();
        expect(result2).toBeTruthy();
        expect(result3).toBeTruthy();
      });

      it('should return true for next 3 mondays', () => {
        const result1 = subject.doesOccureOn(
          ExactDate.create({
            day: 30,
            month: 1,
            year: 2023,
          }),
          school,
        );
        const result2 = subject.doesOccureOn(
          ExactDate.create({
            day: 6,
            month: 2,
            year: 2023,
          }),
          school,
        );
        const result3 = subject.doesOccureOn(
          ExactDate.create({
            day: 13,
            month: 2,
            year: 2023,
          }),
          school,
        );

        expect(result1).toBeTruthy();
        expect(result2).toBeTruthy();
        expect(result3).toBeTruthy();
      });

      it('should return false for fridays and mondays before subject creation date', () => {
        const result1 = subject.doesOccureOn(
          ExactDate.create({
            day: 23,
            month: 1,
            year: 2023,
          }),
          school,
        );
        const result2 = subject.doesOccureOn(
          ExactDate.create({
            day: 20,
            month: 1,
            year: 2023,
          }),
          school,
        );

        expect(result1).toBeFalsy();
        expect(result2).toBeFalsy();
      });

      it('should return false for days that are not in the recurrence', () => {
        const result1 = subject.doesOccureOn(
          ExactDate.create({
            day: 26,
            month: 1,
            year: 2023,
          }),
          school,
        );
        const result2 = subject.doesOccureOn(
          ExactDate.create({
            day: 22,
            month: 2,
            year: 2023,
          }),
          school,
        );
        const result3 = subject.doesOccureOn(
          ExactDate.create({
            day: 15,
            month: 1,
            year: 2023,
          }),
          school,
        );

        expect(result1).toBeFalsy();
        expect(result2).toBeFalsy();
        expect(result3).toBeFalsy();
      });
    });
  });
});

function createSubject(data: Omit<CreateSubject, 'school' | 'group'>) {
  const school = School.create({
    id: SchoolId.create(),
    name: 'School',
    timeZone: TimeZone.create('Europe/Moscow'),
    now: DateTime.now(),
  });
  const group = Group.create({
    id: GroupId.create(),
    name: 'Group',
    school,
    now: DateTime.now(),
  });
  const subject = Subject.create({
    ...data,
    id: SubjectId.create(),
    group,
    name: 'Subject',
    school,
  });

  return { subject, school };
}
