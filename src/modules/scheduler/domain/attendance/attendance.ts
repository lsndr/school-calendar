import { Entity } from '@mikro-orm/core';
import * as assert from 'assert';
import { DateTime } from 'luxon';
import { AggregateEvents } from '../../../shared/domain';
import { Employee } from '../employee';
import { Office } from '../office';
import { ExactDate, TimeInterval } from '../shared';
import { Visit } from '../visit';
// eslint-disable-next-line import/no-cycle -- Required by MikroORM
import { AssignedEmployee } from './assigned-employee';
import { AssignedEmployeeId } from './assigned-employee-id';
import { AttendanceCreatedEvent } from './attendance-created.event';
import { AttendanceId } from './attendance-id';
import { AttendanceUpdatedEvent } from './attendance-updated.event';
import { AttendanceState } from './attendance.state';

export type CreateAttendance = {
  id: AttendanceId;
  visit: Visit;
  date: ExactDate;
  time: TimeInterval;
  office: Office;
  now: DateTime;
};

@Entity({ tableName: 'attendance' })
export class Attendance extends AttendanceState {
  get visitId() {
    return this._visitId;
  }

  get date() {
    return this._date;
  }

  get time() {
    return this._time;
  }

  get assignedEmployees(): ReadonlyArray<
    Readonly<Omit<AssignedEmployee, 'attendance'>>
  > {
    return this._assignedEmployees.getItems();
  }

  get officeId() {
    return this._officeId;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  get createdAt() {
    return this._createdAt;
  }

  static create(data: CreateAttendance) {
    this.assertNotInPast(data.date, data.time, data.office, data.now);
    assert.ok(
      data.visit.doesOccureOn(data.date, data.office),
      'Date is not in visit recurrence',
    );

    const eventsManager = new AggregateEvents();
    const attendance = new this({
      id: data.id,
      visitId: data.visit.id,
      time: data.time,
      date: data.date,
      officeId: data.office.id,
      createdAt: data.now,
      updatedAt: data.now,
    });

    eventsManager.add(
      new AttendanceCreatedEvent({
        id: {
          visitId: attendance.visitId.value,
          date: {
            day: attendance.date.day,
            month: attendance.date.month,
            year: attendance.date.year,
          },
        },
        time: attendance.time,
        employeeIds: [],
        createdAt: attendance.createdAt.toISO(),
        updatedAt: attendance.updatedAt.toISO(),
      }),
    );

    return attendance;
  }

  protected assertAttendanceNotInPast(office: Office, now: DateTime) {
    Attendance.assertNotInPast(this.date, this.time, office, now);
  }

  assignEmployee(
    employee: Employee,
    visit: Visit,
    office: Office,
    now: DateTime,
  ) {
    if (this.isEmployeeAssigned(employee.id.value)) {
      return;
    }

    assert.ok(
      visit.officeId.value === this.officeId.value,
      "Visit must belong to the attendance's office",
    );
    assert.ok(
      this._assignedEmployees.length + 1 <= visit.requiredEmployees.value,
      'Too many employees assigned',
    );
    this.assertAttendanceNotInPast(office, now);
    assert.ok(
      employee.officeId.value === this.officeId.value,
      "Employee must belong to the attendance's office",
    );
    assert.ok(
      office.id.value === this.officeId.value,
      "Office must the same as the attendance's office",
    );

    const assignedEmployee = new AssignedEmployee({
      id: AssignedEmployeeId.create(),
      assignedAt: now,
      employeeId: employee.id,
    });

    this._assignedEmployees.add(assignedEmployee);
    this._updatedAt = now;
    this.addOrReplaceUpdatedEvent();
  }

  unassignEmployee(employeeId: string, office: Office, now: DateTime) {
    this.assertAttendanceNotInPast(office, now);
    assert.ok(
      office.id.value === this.officeId.value,
      "Office must the same as the attendance's office",
    );

    for (const employee of this._assignedEmployees) {
      if (employee.employeeId.value === employeeId) {
        this._assignedEmployees.remove(employee);
      }
    }

    this._updatedAt = now;
    this.addOrReplaceUpdatedEvent();
  }

  isEmployeeAssigned(employeeId: string) {
    for (const employee of this._assignedEmployees) {
      if (employee.employeeId.value === employeeId) {
        return true;
      }
    }

    return false;
  }

  setTime(time: TimeInterval, now: DateTime) {
    this._time = time;
    this._updatedAt = now;

    this.addOrReplaceUpdatedEvent();
  }

  protected addOrReplaceUpdatedEvent() {
    const event = new AttendanceUpdatedEvent({
      id: {
        visitId: this._visitId.value,
        date: {
          day: this._date.day,
          month: this._date.month,
          year: this._date.year,
        },
      },
      time: this.time,
      employeeIds: this._assignedEmployees
        .getItems()
        .map((employee) => employee.employeeId.value),
      createdAt: this.createdAt.toISO(),
      updatedAt: this.updatedAt.toISO(),
    });

    this._eventsManager.replaceInstanceOrAdd(AttendanceUpdatedEvent, event);
  }

  protected static assertNotInPast(
    date: ExactDate,
    time: TimeInterval,
    office: Office,
    now: DateTime,
  ) {
    const startsAt = date
      .toDateTime(office.timeZone)
      .plus({ minutes: time.startsAt });

    assert.ok(
      now.toMillis() < startsAt.toMillis(),
      'Attendance in past can not be modified or created',
    );
  }
}
