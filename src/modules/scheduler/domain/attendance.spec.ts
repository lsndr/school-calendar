import { MikroORM } from '@mikro-orm/postgresql';
import { DateTime } from 'luxon';
import { AssignedEmployee } from './assigned-employee';
import { Attendance } from './attendance';
import { AttendanceId } from './attendance-id';
import { Client } from './client';
import { ClientId } from './client-id';
import { Employee } from './employee';
import { EmployeeId } from './employee-id';
import { ExactDate } from './exact-date';
import { Office } from './office';
import { OfficeId } from './office-id';
import { WeekDays, WeeklyRecurrence } from './recurrence';
import { RequiredEmployees } from './required-employees';
import { TimeInterval } from './time-interval';
import { TimeZone } from './time-zone';
import { Visit } from './visit';
import { VisitId } from './visit-id';

describe('Attendance', () => {
  let office: Office;
  let office2: Office;
  let visit: Visit;
  let visit2: Visit;
  let client: Client;
  let client2: Client;
  let employee1: Employee;
  let employee2: Employee;
  let employee3: Employee;
  let employee4: Employee;

  beforeAll(async () => {
    await MikroORM.init(
      {
        dbName: ':memory:',
        entities: [Attendance, AssignedEmployee],
      },
      false,
    );
  });

  beforeEach(() => {
    office = Office.create({
      id: OfficeId.create(),
      name: 'Test Office',
      timeZone: TimeZone.create('Europe/Moscow'),
      now: DateTime.now(),
    });

    office2 = Office.create({
      id: OfficeId.create(),
      name: 'Test Office 2',
      timeZone: TimeZone.create('Europe/Moscow'),
      now: DateTime.now(),
    });
  });

  beforeEach(() => {
    client = Client.create({
      id: ClientId.create(),
      name: 'Test Client',
      office: office,
      now: DateTime.now(),
    });

    client2 = Client.create({
      id: ClientId.create(),
      name: 'Test Client 2',
      office: office2,
      now: DateTime.now(),
    });
  });

  beforeEach(() => {
    const weekDays: (typeof WeekDays)[number][] = [1, 0];

    const recurrence = WeeklyRecurrence.create(weekDays);
    const time = TimeInterval.create({
      startsAt: 0,
      duration: 120,
    });
    const requiredEmployees = RequiredEmployees.create(2);

    visit = Visit.create({
      id: VisitId.create(),
      client,
      office,
      recurrence,
      name: 'Test Visit',
      time,
      requiredEmployees,
      now: DateTime.fromISO('2023-01-20T00:00:00.000Z'),
    });

    visit2 = Visit.create({
      id: VisitId.create(),
      client: client2,
      office: office2,
      recurrence,
      name: 'Test Visit',
      time,
      requiredEmployees,
      now: DateTime.fromISO('2023-01-20T00:00:00.000Z'),
    });
  });

  beforeEach(() => {
    const id1 = EmployeeId.create();
    const id2 = EmployeeId.create();
    const id3 = EmployeeId.create();

    employee1 = Employee.create({
      id: id1,
      name: 'Employee 1',
      now: DateTime.now(),
      office,
    });

    employee2 = Employee.create({
      id: id2,
      name: 'Employee 2',
      now: DateTime.now(),
      office,
    });

    employee3 = Employee.create({
      id: id3,
      name: 'Employee 3',
      now: DateTime.now(),
      office,
    });

    employee4 = Employee.create({
      id: id3,
      name: 'Employee 4',
      now: DateTime.now(),
      office: office2,
    });
  });

  it("should fail to add an employee if number of employees exceeds number of visit's required employees", () => {
    const id = AttendanceId.create();
    const now = DateTime.fromISO('2023-01-20T12:00:00.000Z');
    const date = ExactDate.create({
      day: 21,
      month: 1,
      year: 2023,
    });
    const time = TimeInterval.create({
      startsAt: 0,
      duration: 60,
    });
    const attendance = Attendance.create({
      id,
      visit,
      date,
      time,
      office,
      now,
    });

    attendance.assignEmployee(employee1, visit, office, now);
    attendance.assignEmployee(employee2, visit, office, now);

    const act = () => attendance.assignEmployee(employee3, visit, office, now);

    expect(act).toThrow('Too many employees assigned');
  });

  it('should fail to add an employee if visit belong to another office', () => {
    const now = DateTime.fromISO('2023-01-20T12:00:00.000Z');
    const date = ExactDate.create({
      day: 21,
      month: 1,
      year: 2023,
    });
    const id = AttendanceId.create();
    const time = TimeInterval.create({
      startsAt: 0,
      duration: 60,
    });
    const attendance = Attendance.create({
      id,
      visit,
      date,
      time,
      office,
      now,
    });

    const act = () => attendance.assignEmployee(employee3, visit2, office, now);

    expect(act).toThrow("Visit must belong to the attendance's office");
  });

  it('should fail to add an employee office reference has different id', () => {
    const now = DateTime.fromISO('2023-01-20T12:00:00.000Z');
    const date = ExactDate.create({
      day: 21,
      month: 1,
      year: 2023,
    });
    const id = AttendanceId.create();
    const time = TimeInterval.create({
      startsAt: 0,
      duration: 60,
    });
    const attendance = Attendance.create({
      id,
      visit,
      date,
      time,
      office,
      now,
    });

    const act = () => attendance.assignEmployee(employee3, visit, office2, now);

    expect(act).toThrow("Office must the same as the attendance's office");
  });

  it('should fail to add an employee if it belongs to another office', () => {
    const now = DateTime.fromISO('2023-01-20T12:00:00.000Z');
    const date = ExactDate.create({
      day: 21,
      month: 1,
      year: 2023,
    });
    const id = AttendanceId.create();
    const time = TimeInterval.create({
      startsAt: 0,
      duration: 60,
    });
    const attendance = Attendance.create({
      id,
      visit,
      date,
      time,
      office,
      now,
    });

    const act = () => attendance.assignEmployee(employee4, visit, office, now);

    expect(act).toThrow("Employee must belong to the attendance's office");
  });

  it('should fail to create an attendance in past', () => {
    const now = DateTime.fromISO('2023-01-20T12:00:00.000Z');
    const date = ExactDate.create({
      day: 20,
      month: 1,
      year: 2023,
    });
    const time = TimeInterval.create({
      startsAt: 0,
      duration: 60,
    });
    const id = AttendanceId.create();

    const act = () =>
      Attendance.create({
        id,
        visit,
        date,
        office,
        time,
        now,
      });

    expect(act).toThrow('Attendance in past can not be modified or created');
  });

  it('should fail to add an employee to an attendance in past', () => {
    const nowInPast = DateTime.fromISO('2023-01-20T12:00:00.000Z');
    const nowInFuture = DateTime.fromISO('2023-01-22T12:00:00.000Z');
    const date = ExactDate.create({
      day: 21,
      month: 1,
      year: 2023,
    });
    const time = TimeInterval.create({
      startsAt: 0,
      duration: 60,
    });
    const id = AttendanceId.create();
    const attendance = Attendance.create({
      id,
      visit,
      date,
      office,
      time,
      now: nowInPast,
    });

    const act = () =>
      attendance.assignEmployee(employee1, visit, office, nowInFuture);

    expect(act).toThrow('Attendance in past can not be modified or created');
  });

  it('should add an employee', () => {
    const now = DateTime.fromISO('2023-01-20T12:00:00.000Z');
    const id = AttendanceId.create();
    const date = ExactDate.create({
      day: 21,
      month: 1,
      year: 2023,
    });
    const time = TimeInterval.create({
      startsAt: 0,
      duration: 60,
    });
    const attendance = Attendance.create({
      id,
      visit,
      date,
      office,
      time,
      now,
    });

    attendance.assignEmployee(employee1, visit, office, now);

    expect(attendance.assignedEmployees.length).toBe(1);
    expect(attendance.assignedEmployees[0]?.assignedAt).toBe(now);
    expect(attendance.assignedEmployees[0]?.employeeId).toBe(employee1.id);
  });
});
