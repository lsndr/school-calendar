import * as assert from 'assert';
import { DateTime } from 'luxon';
import {
  Aggregate,
  AggregateState,
  AggregateEvents,
} from '../../shared/domain';
import { AttendanceCreatedEvent } from './attendance-created.event';
import { AttendanceId } from './attendance-id';
import { AttendanceUpdatedEvent } from './attendance-updated.event';
import { Employee } from './employee';
import { EmployeeId } from './employee-id';
import { ExactDate } from './exact-date';
import { Office } from './office';
import { OfficeId } from './office-id';
import { TimeInterval } from './time-interval';
import { Visit } from './visit';

export type CreateAttendance = {
  id: AttendanceId;
  time: TimeInterval;
  office: Office;
  now: DateTime;
};

export interface AttendanceState extends AggregateState<AttendanceId> {
  time: TimeInterval;
  officeId: OfficeId;
  employeeIds: Map<string, EmployeeId>;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export class Attendance extends Aggregate<AttendanceId, AttendanceState> {
  get time() {
    return this.state.time;
  }

  get employeeIds(): ReadonlyArray<EmployeeId> {
    return Array.from(this.state.employeeIds.values());
  }

  get officeId() {
    return this.state.officeId;
  }

  get updatedAt() {
    return this.state.updatedAt;
  }

  get createdAt() {
    return this.state.createdAt;
  }

  static create(data: CreateAttendance) {
    this.assertNotInPast(
      data.id.date,
      data.time,
      data.office,
      data.now,
    );

    const eventsManager = new AggregateEvents();
    const attendance = new this(
      {
        id: data.id,
        time: data.time,
        officeId: data.office.id,
        employeeIds: new Map(),
        createdAt: data.now,
        updatedAt: data.now,
      },
      eventsManager,
    );

    eventsManager.add(
      new AttendanceCreatedEvent({
        id: {
          visitId: attendance.id.visitId.value,
          date: {
            day: attendance.id.date.day,
            month: attendance.id.date.month,
            year: attendance.id.date.year,
          },
        },
        time: attendance.time,
        employeeIds: Array.from(attendance.employeeIds).map((id) => id.value),
        createdAt: attendance.createdAt.toISO(),
        updatedAt: attendance.updatedAt.toISO(),
      }),
    );

    return attendance;
  }

  protected assertAttendanceNotInPast(office: Office, now: DateTime) {
    Attendance.assertNotInPast(this.id.date, this.time, office, now);
  }

  assignEmployee(
    employee: Employee,
    visit: Visit,
    office: Office,
    now: DateTime,
  ) {
    assert.ok(
      visit.officeId.value === this.officeId.value,
      "Visit must belong to the attendance's office",
    );
    assert.ok(
      this.state.employeeIds.size + 1 <= visit.requiredEmployees.amount,
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

    this.state.employeeIds.set(employee.id.value, employee.id);
    this.state.updatedAt = now;

    this.addOrReplaceUpdatedEvent();
  }

  unassignEmployee(employeeId: string, office: Office, now: DateTime) {
    this.assertAttendanceNotInPast(office, now);
    assert.ok(
      office.id.value === this.officeId.value,
      "Office must the same as the attendance's office",
    );

    this.state.employeeIds.delete(employeeId);
    this.state.updatedAt = now;

    this.addOrReplaceUpdatedEvent();
  }

  setTime(time: TimeInterval, now: DateTime) {
    this.state.time = time;
    this.state.updatedAt = now;

    this.addOrReplaceUpdatedEvent();
  }

  protected addOrReplaceUpdatedEvent() {
    const event = new AttendanceUpdatedEvent({
      id: {
        visitId: this.id.visitId.value,
        date: {
          day: this.id.date.day,
          month: this.id.date.month,
          year: this.id.date.year,
        },
      },
      time: this.time,
      employeeIds: Array.from(this.employeeIds).map((id) => id.value),
      createdAt: this.createdAt.toISO(),
      updatedAt: this.updatedAt.toISO(),
    });

    this.eventsManager.replaceInstanceOrAdd(AttendanceUpdatedEvent, event);
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
